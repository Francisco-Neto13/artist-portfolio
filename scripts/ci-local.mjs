/**
 * Roda a CI inteira aqui. O pre-push chama isto antes de subir para a `main`.
 *
 *   npm run ci
 *
 * ⚠️ O valor disto nao e repetir os comandos (`npm run verificar` ja faz isso).
 * E reproduzir o AMBIENTE da CI: um clone limpo, em UTC, sem `.env.local`.
 * Por isso os testes rodam com TZ=UTC, o build roda com envs de mentira em vez
 * das suas de verdade, e o primeiro passo procura fonte escondido pelo
 * .gitignore — arquivo que existe na sua maquina e nao existe no clone.
 *
 * Passo novo entra nos DOIS lugares: aqui e no `.github/workflows/ci.yml`.
 * O ultimo passo (`Espelho do ci.yml`) acusa quando um fica para tras.
 */

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const VERDE = '\x1b[32m';
const VERMELHO = '\x1b[31m';
const CINZA = '\x1b[90m';
const FIM = '\x1b[0m';

/**
 * As pastas cujo conteudo o build consome. `documentation/` fica de fora por
 * decisao, e `supabase/` inteira tambem nao serve: o CLI guarda estado local em
 * `supabase/.temp/`, ignorado de proposito. O que importa e `migrations/` — uma
 * migracao escondida pelo .gitignore existiria na sua maquina, ja aplicada, e
 * sumiria do repositorio sem ninguem notar.
 */
const PASTAS_DE_CODIGO = ['src', 'scripts', 'supabase/migrations'];

/**
 * Envs de mentira do build, iguais as do ci.yml. Um clone limpo nao tem
 * `.env.local`; rodar com as SUAS credenciais aqui esconderia justamente o
 * caso que a CI pega.
 */
const ENV_BUILD = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://ci.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'ci',
  // Em pasta separada: as envs acima sao NEXT_PUBLIC e entram no bundle, entao
  // buildar em `.next` deixaria o seu `npm start` apontando para a credencial
  // de mentira. No runner do GitHub isso nao importa (o clone e descartado),
  // por isso o ci.yml nao precisa desta linha.
  NEXT_DIST_DIR: '.next-ci',
};

function rodar(comando, args, opcoes = {}) {
  // ⚠️ Shell so para npm/npx, que no Windows sao `.cmd`. Com shell ligado,
  // argumento com espaco seria quebrado no meio; por isso a linha vai inteira
  // (args de npm aqui nunca tem espaco).
  const precisaDeShell = process.platform === 'win32' && ['npm', 'npx'].includes(comando);
  const [cmd, argv] = precisaDeShell ? [[comando, ...args].join(' '), []] : [comando, args];

  return spawnSync(cmd, argv, {
    cwd: raiz,
    shell: precisaDeShell,
    encoding: 'utf8',
    ...opcoes,
    env: { ...process.env, ...(opcoes.env ?? {}) },
  });
}

const passos = [
  {
    nome: 'Nenhum fonte ignorado pelo git',
    executar: () => {
      const r = rodar('git', [
        'ls-files', '--others', '--ignored', '--exclude-standard', '--directory',
        '--', ...PASTAS_DE_CODIGO,
      ]);
      if (r.status !== 0) return { status: 1, stderr: `git falhou: ${r.stderr}` };

      const escondidos = (r.stdout ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
      if (escondidos.length === 0) return { status: 0, stderr: '' };

      return {
        status: 1,
        stderr: [
          'Estes caminhos existem aqui e NAO existem num clone limpo:',
          ...escondidos.map((c) => `  ${c}`),
          '',
          'Rode `git check-ignore -v <caminho>` para ver qual regra pegou.',
        ].join('\n'),
      };
    },
  },
  { nome: 'Lint', executar: () => rodar('npm', ['run', 'lint']) },
  { nome: 'Tipos', executar: () => rodar('npm', ['run', 'typecheck']) },
  { nome: 'Testes', executar: () => rodar('npm', ['test'], { env: { TZ: 'UTC' } }) },
  { nome: 'Schema e segredos', executar: () => rodar('npm', ['run', 'check:schema']) },
  {
    nome: 'Build de producao',
    // O Next NAO sobrescreve o que ja existe em process.env quando le o
    // `.env.local`, entao estes valores vencem o seu arquivo local — que e o
    // ponto: o build tem de ser conferido com credencial que nao funciona.
    executar: () => rodar('npm', ['run', 'build'], { env: ENV_BUILD }),
  },
  {
    nome: 'Espelho do ci.yml',
    // Alguem acrescenta um passo no ci.yml e esquece daqui: o `npm run ci`
    // volta a mentir sobre o que a CI remota vai fazer.
    executar: () => {
      const yml = readFileSync(path.join(raiz, '.github', 'workflows', 'ci.yml'), 'utf8');
      // Fora da lista: passos de preparo do runner, que localmente nao existem.
      const soDoRunner = ['Checkout', 'Node', 'Instalar dependencias'];
      const noYml = [...yml.matchAll(/^\s+- name: (.+)$/gm)]
        .map((m) => m[1].trim())
        .filter((n) => !soDoRunner.includes(n));
      const aqui = new Set(passos.map((p) => p.nome));
      const faltando = noYml.filter((n) => !aqui.has(n));
      return faltando.length === 0
        ? { status: 0, stderr: '' }
        : { status: 1, stderr: `passos no ci.yml que nao existem aqui: ${faltando.join(', ')}` };
    },
  },
];

console.log('\nRodando a CI local\n');

let falhou = false;
for (const passo of passos) {
  const inicio = Date.now();
  const r = passo.executar();
  const s = `${((Date.now() - inicio) / 1000).toFixed(1)}s`;

  if (r.status === 0) {
    console.log(`  ${VERDE}ok${FIM}  ${passo.nome} ${CINZA}${s}${FIM}`);
  } else {
    falhou = true;
    console.log(`  ${VERMELHO}XX${FIM}  ${passo.nome} ${CINZA}${s}${FIM}`);
    const saida = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim();
    console.log(saida.split('\n').slice(-25).map((l) => `      ${l}`).join('\n'));
    break; // falha rapido: continuar depois de um lint quebrado so gasta tempo
  }
}

if (falhou) {
  console.log(`\n${VERMELHO}A CI falharia.${FIM} Corrija antes de subir.\n`);
  process.exit(1);
}

console.log(`\n${VERDE}Tudo verde.${FIM} A CI deve passar.\n`);
