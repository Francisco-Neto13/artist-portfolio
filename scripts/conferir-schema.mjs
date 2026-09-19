/**
 * Guardas do schema versionado e das chaves do Supabase.
 *
 *   npm run check:schema
 *
 * As migracoes deste projeto nao passam por lint nenhum e nao sao aplicadas na
 * CI: elas dependem dos schemas `auth` e `storage`, que so existem numa
 * instancia Supabase de verdade (subir uma pede `supabase start`, Docker e
 * varios minutos por push). O que da para conferir de graca, e que ja custou
 * caro aqui, e o que este script olha:
 *
 *   1. UUID de admin no SQL versionado. A migracao 20260315170000 foi escrita
 *      justamente para PARAR de embutir o uuid real do admin nas policies — ela
 *      extrai os ids das policies antigas em vez de lista-los. Nada garantia
 *      que a proxima migracao nao voltasse a colar o uuid na mao.
 *
 *   2. `service_role` no codigo do app. Essa chave passa por cima de toda a
 *      RLS. Num app que escreve no Supabase direto do browser, ela vazar
 *      significa entregar o banco inteiro. Hoje o projeto nao usa, e o jeito de
 *      continuar assim e quebrar a CI no dia em que alguem tentar.
 *
 *   3. `.env` versionado. O `.gitignore` cobre, mas `git add -f` passa por cima
 *      e o arquivo fica no historico para sempre.
 *
 *   4. Nome das migracoes. O Supabase aplica em ordem alfabetica do nome do
 *      arquivo; um arquivo fora do padrao `<timestamp>_<nome>.sql` entra na
 *      ordem errada e so se descobre no deploy.
 */

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pastaMigracoes = path.join(raiz, 'supabase', 'migrations');

const problemas = [];

// --- 1. UUID literal nas migracoes -----------------------------------------
const UUID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
// O uuid zerado e placeholder reconhecivel, nao identifica ninguem.
const UUID_PERMITIDOS = new Set(['00000000-0000-0000-0000-000000000000']);

const migracoes = readdirSync(pastaMigracoes).filter((f) => f.endsWith('.sql')).sort();

for (const arquivo of migracoes) {
  const conteudo = readFileSync(path.join(pastaMigracoes, arquivo), 'utf8');

  for (const achado of conteudo.match(UUID) ?? []) {
    if (UUID_PERMITIDOS.has(achado.toLowerCase())) continue;
    problemas.push(
      `${arquivo}: uuid literal ${achado}\n` +
        '    Nao embuta id de usuario no schema versionado — o repositorio e publico.\n' +
        '    Insira em admin_users por fora, ou derive como a 20260315170000 faz.',
    );
  }
}

// --- 2. Nome das migracoes --------------------------------------------------
const PADRAO_NOME = /^\d{14}_[a-z0-9_]+\.sql$/;
for (const arquivo of migracoes) {
  if (!PADRAO_NOME.test(arquivo)) {
    problemas.push(
      `${arquivo}: fora do padrao <timestamp de 14 digitos>_<nome_em_snake_case>.sql\n` +
        '    O Supabase aplica na ordem alfabetica do nome; fora do padrao, aplica fora de ordem.',
    );
  }
}

// --- 3. service_role no codigo do app ---------------------------------------
const PASTAS_DE_CODIGO = ['src', 'scripts'];
const EXTENSOES = new Set(['.ts', '.tsx', '.mts', '.mjs', '.js', '.jsx']);

function* arquivosDe(dir) {
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const completo = path.join(dir, entrada.name);
    if (entrada.isDirectory()) yield* arquivosDe(completo);
    else if (EXTENSOES.has(path.extname(entrada.name))) yield completo;
  }
}

for (const pasta of PASTAS_DE_CODIGO) {
  const completo = path.join(raiz, pasta);
  for (const arquivo of arquivosDe(completo)) {
    // Este proprio script fala de service_role para poder proibi-lo.
    if (arquivo === fileURLToPath(import.meta.url)) continue;

    const conteudo = readFileSync(arquivo, 'utf8');
    if (/service_role|SERVICE_ROLE/.test(conteudo)) {
      problemas.push(
        `${path.relative(raiz, arquivo)}: menciona service_role\n` +
          '    Essa chave ignora a RLS inteira. Este app escreve no Supabase pelo browser:\n' +
          '    tudo tem de passar pela anon key + policies.',
      );
    }
  }
}

// --- 4. .env versionado ------------------------------------------------------
try {
  const versionados = execFileSync('git', ['ls-files', '--', '.env', '.env.*'], {
    cwd: raiz,
    encoding: 'utf8',
  })
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    // `.env.example` e para estar versionado: e a documentacao das variaveis.
    .filter((f) => f !== '.env.example');

  for (const arquivo of versionados) {
    problemas.push(
      `${arquivo}: arquivo de ambiente versionado\n` +
        '    Rode `git rm --cached` nele. Se tinha segredo dentro, rotacione a chave:\n' +
        '    tirar do HEAD nao tira do historico.',
    );
  }
} catch {
  // Fora de um repositorio git (tarball, por exemplo): nada a conferir.
}

// --- resultado ---------------------------------------------------------------
if (problemas.length > 0) {
  console.error(`\nConferencia do schema falhou (${problemas.length}):\n`);
  for (const problema of problemas) console.error(`  - ${problema}\n`);
  process.exit(1);
}

console.log(`Schema ok: ${migracoes.length} migracoes conferidas.`);
