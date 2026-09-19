import type { NextConfig } from 'next';

/**
 * O host do Storage sai da mesma env que o resto do app usa para falar com o
 * Supabase. Antes era o ref do projeto escrito na mao aqui dentro: trocar de
 * projeto Supabase deixava este arquivo apontando para o antigo, e o
 * `next/image` passava a recusar TODA imagem com "hostname not configured" —
 * sem nenhuma pista de que o culpado era um literal esquecido no config.
 */
function supabaseHostname(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;

  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const hostname = supabaseHostname();

// Build sem a env (um clone limpo na CI, por exemplo) nao pode quebrar: sem
// host conhecido a lista fica vazia, o que so desliga imagem remota.
/**
 * Os DOIS caminhos publicos do Storage.
 *
 * `object/public` e o arquivo cru; `render/image/public` e o mesmo arquivo
 * redimensionado pelo Supabase, que e o que o `getOptimizedUrl` devolve.
 *
 * ⚠️ Liberar so o primeiro quebrou os cards de commission em runtime — eles
 * usam `next/image`, que RECUSA hostname/caminho fora desta lista. A galeria
 * nao acusou nada porque usa <img> cru. Se mudar o caminho no getOptimizedUrl,
 * mude aqui junto: existe um teste ligando os dois (imageUtils.test.ts).
 */
const CAMINHOS_PUBLICOS = [
  '/storage/v1/object/public/**',
  '/storage/v1/render/image/public/**',
];

const remotePatterns = hostname
  ? CAMINHOS_PUBLICOS.map((pathname) => ({
      protocol: 'https' as const,
      hostname,
      port: '',
      pathname,
    }))
  : [];

const nextConfig: NextConfig = {
  /**
   * A CI local builda em `.next-ci`, nao em `.next`.
   *
   * O `npm run ci` builda de proposito com credencial de mentira do Supabase.
   * Como as envs sao NEXT_PUBLIC, elas entram no bundle — e sem isto o build da
   * CI sobrescrevia o `.next` de verdade. Quem rodasse `npm start` logo depois
   * pegava um site apontando para `ci.supabase.co`, sem nenhum aviso.
   */
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    remotePatterns,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
        ],
      },
    ];
  },
};

export default nextConfig;
