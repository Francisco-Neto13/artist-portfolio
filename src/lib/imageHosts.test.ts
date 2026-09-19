import { describe, expect, it, beforeAll } from 'vitest';
import { getOptimizedUrl } from '@/lib/imageUtils';

/**
 * Amarra o `getOptimizedUrl` ao `remotePatterns` do next.config.
 *
 * O que este teste existe para impedir ja aconteceu: ao apontar o
 * `getOptimizedUrl` para `/render/image/public/`, o `remotePatterns` continuou
 * liberando so `/object/public/`. A galeria nao acusou nada (usa <img> cru),
 * mas os cards de commission usam `next/image`, que RECUSA caminho fora da
 * lista — e a home quebrou em runtime, sem lint nem tsc dizerem nada.
 */

const HOST = 'projeto.supabase.co';
const ORIGINAL = `https://${HOST}/storage/v1/object/public/gallery/artworks/a.webp`;

type Padrao = { protocol?: string; hostname: string; pathname?: string };
let padroes: Padrao[];

beforeAll(async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = `https://${HOST}`;
  const config = (await import('../../next.config')).default;
  padroes = (config.images?.remotePatterns ?? []) as Padrao[];
});

/** Casa o glob do Next (`/a/**`) com um pathname. */
function casa(pathname: string, padrao?: string): boolean {
  if (!padrao) return true;
  const prefixo = padrao.replace(/\*\*$/, '');
  return pathname.startsWith(prefixo);
}

describe('remotePatterns x getOptimizedUrl', () => {
  it('libera o host do Supabase', () => {
    expect(padroes.length).toBeGreaterThan(0);
    expect(padroes.every((p) => p.hostname === HOST)).toBe(true);
  });

  it('a url que o getOptimizedUrl gera e aceita pelo next/image', () => {
    const url = new URL(getOptimizedUrl(ORIGINAL, 85, 800));
    const aceita = padroes.some((p) => casa(url.pathname, p.pathname));
    expect(aceita, `nenhum remotePattern cobre ${url.pathname}`).toBe(true);
  });

  it('a url crua continua aceita — e o alvo do fallback do onError', () => {
    const url = new URL(ORIGINAL);
    const aceita = padroes.some((p) => casa(url.pathname, p.pathname));
    expect(aceita, `nenhum remotePattern cobre ${url.pathname}`).toBe(true);
  });

  it('nao libera caminho fora do storage publico', () => {
    const privado = `https://${HOST}/storage/v1/object/authenticated/gallery/a.webp`;
    const pathname = new URL(privado).pathname;
    expect(padroes.some((p) => casa(pathname, p.pathname))).toBe(false);
  });
});
