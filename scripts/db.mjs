/**
 * Ponte entre o `.env.local` e a CLI do Supabase.
 *
 *   npm run db:push -- --dry-run   # mostra o que seria aplicado, sem aplicar
 *   npm run db:push                # aplica as migracoes pendentes
 *   npm run db:types               # regera src/lib/database.types.ts
 *
 * Por que existe, em vez de chamar `npx supabase` direto:
 *
 *   1. A CLI quer a connection string por flag, e no Windows exportar variavel
 *      antes do comando muda conforme o shell (cmd, PowerShell, Git Bash). Aqui
 *      a leitura do `.env.local` e a mesma em qualquer um.
 *   2. A string tem a senha do banco dentro. Passada por flag, ela aparece na
 *      lista de processos e no historico do shell; lida do arquivo, nao.
 *   3. Erra cedo e com mensagem util quando a variavel nao esta configurada,
 *      em vez de deixar a CLI tentar `localhost` e falar de "Network Bans".
 *
 * ⚠️ `SUPABASE_DB_URL` da acesso total ao banco e passa por cima de TODA a RLS.
 * Ela nao e usada pelo app em runtime — so por aqui. O `.gitignore` cobre
 * `.env*`, e o `check:schema` quebra a CI se algum `.env` for versionado.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERMELHO = '\x1b[31m';
const CINZA = '\x1b[90m';
const FIM = '\x1b[0m';

function lerEnvLocal() {
  const arquivo = path.join(raiz, '.env.local');
  if (!existsSync(arquivo)) return {};

  const valores = {};
  for (const linha of readFileSync(arquivo, 'utf8').split('\n')) {
    const m = linha.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    // Tira aspas em volta, que a pessoa pode ter colado junto do dashboard.
    valores[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return valores;
}

function urlDoBanco() {
  const env = { ...lerEnvLocal(), ...process.env };
  const url = env.SUPABASE_DB_URL;

  if (!url) {
    console.error(`\n${VERMELHO}SUPABASE_DB_URL nao configurada.${FIM}

Ponha uma linha assim no .env.local (o .gitignore ja cobre .env*):

  SUPABASE_DB_URL=postgresql://postgres.<ref>:<senha>@<host>.pooler.supabase.com:5432/postgres

Dashboard -> Project Settings -> Database -> Connection string -> URI.
Use a Session pooler (5432) ou a Direct connection; a Transaction pooler
(6543) nao serve para migracao, porque nao suporta prepared statements.
Senha com caractere especial precisa vir percent-encoded.
`);
    process.exit(1);
  }

  // Uma url correta tem EXATAMENTE um '@': o que separa usuario:senha do host.
  // Mais de um quase sempre significa senha com '@' cru — o `new URL` aceita
  // (parte a string no ultimo '@') e o erro so aparece depois, como falha de
  // DNS, que nao da nenhuma pista da causa real.
  const arrobas = (url.split('://')[1] ?? '').split('@').length - 1;
  if (arrobas > 1) {
    console.error(`\n${VERMELHO}A senha parece ter caractere especial sem encoding.${FIM}`);
    console.error('A URL tem mais de um "@". Troque os da SENHA por %40 (e # por %23, / por %2F, : por %3A).\n');
    process.exit(1);
  }

  try {
    const porta = new URL(url).port;
    if (porta === '6543') {
      console.error(`\n${VERMELHO}Essa e a Transaction pooler (6543).${FIM}`);
      console.error('Migracao precisa da Session pooler (5432) ou da Direct connection.\n');
      process.exit(1);
    }
  } catch {
    console.error(`\n${VERMELHO}SUPABASE_DB_URL nao parece uma URL valida.${FIM}`);
    console.error('Senha com @, #, / ou : precisa estar percent-encoded.\n');
    process.exit(1);
  }

  return url;
}

const comando = process.argv[2];
const extras = process.argv.slice(3);
const url = urlDoBanco();

/** A url nunca vai para o console: so o host, para saber contra o que rodou. */
const host = new URL(url).host;

function rodar(args, opcoes = {}) {
  console.log(`${CINZA}-> supabase ${args.filter((a) => !a.startsWith('postgresql://')).join(' ')}  (${host})${FIM}\n`);
  return spawnSync('npx', ['supabase', ...args], {
    cwd: raiz,
    shell: process.platform === 'win32',
    stdio: opcoes.stdio ?? 'inherit',
    encoding: 'utf8',
  });
}

if (comando === 'push') {
  const r = rodar(['db', 'push', '--db-url', url, ...extras]);
  process.exit(r.status ?? 1);
}

if (comando === 'types') {
  const destino = path.join(raiz, 'src', 'lib', 'database.types.ts');
  const r = rodar(['gen', 'types', 'typescript', '--db-url', url], { stdio: 'pipe' });

  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    process.exit(r.status ?? 1);
  }

  const { writeFileSync } = await import('node:fs');
  writeFileSync(destino, r.stdout, 'utf8');
  console.log(`tipos gravados em ${path.relative(raiz, destino)}`);
  process.exit(0);
}

console.error(`uso: node scripts/db.mjs <push|types> [flags da CLI]`);
process.exit(1);
