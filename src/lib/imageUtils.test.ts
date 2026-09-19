import { describe, expect, it } from 'vitest';
import { formatDate, getOptimizedUrl, getOriginalImageUrl } from '@/lib/imageUtils';

const ORIGINAL = 'https://projeto.supabase.co/storage/v1/object/public/gallery/artworks/a.webp';

describe('getOptimizedUrl', () => {
  it('aponta para o endpoint de render, nao para o objeto cru', () => {
    // O motivo do teste: `/object/public/` IGNORA os parametros em silencio.
    // A galeria servia os originais (20,5 MB na home) sem nenhum sinal disso.
    const url = new URL(getOptimizedUrl(ORIGINAL, 82, 800));
    expect(url.pathname).toContain('/storage/v1/render/image/public/');
    expect(url.pathname).not.toContain('/storage/v1/object/public/');
    expect(url.searchParams.get('width')).toBe('800');
    expect(url.searchParams.get('quality')).toBe('82');
    // `contain` preserva o enquadramento da obra.
    expect(url.searchParams.get('resize')).toBe('contain');
    // `format` nao e parametro valido do Supabase; a negociacao e pelo Accept.
    expect(url.searchParams.get('format')).toBeNull();
  });

  it('preserva o caminho do arquivo ao trocar de endpoint', () => {
    const url = new URL(getOptimizedUrl(ORIGINAL, 82, 800));
    expect(url.pathname.endsWith('/gallery/artworks/a.webp')).toBe(true);
  });

  it('sobrescreve os parametros em vez de duplicar', () => {
    const umaVez = getOptimizedUrl(ORIGINAL, 82, 800);
    const duasVezes = getOptimizedUrl(umaVez, 60, 400);
    expect(duasVezes.match(/width=/g)).toHaveLength(1);
    expect(new URL(duasVezes).searchParams.get('width')).toBe('400');
  });

  it('deixa em paz o que nao e do Supabase', () => {
    expect(getOptimizedUrl('https://exemplo.com/a.png')).toBe('https://exemplo.com/a.png');
    expect(getOptimizedUrl('')).toBe('');
    expect(getOptimizedUrl('nao e url')).toBe('nao e url');
  });
});

describe('getOriginalImageUrl', () => {
  it('desfaz o getOptimizedUrl', () => {
    expect(getOriginalImageUrl(getOptimizedUrl(ORIGINAL, 82, 800))).toBe(ORIGINAL);
  });

  it('preserva parametros que nao sao de transformacao', () => {
    const url = getOriginalImageUrl(`${ORIGINAL}?t=123&width=800`);
    expect(new URL(url).searchParams.get('t')).toBe('123');
    expect(new URL(url).searchParams.get('width')).toBeNull();
  });

  it('devolve a entrada quando ela nao e url', () => {
    expect(getOriginalImageUrl('nao e url')).toBe('nao e url');
    expect(getOriginalImageUrl('')).toBe('');
  });
});

describe('formatDate', () => {
  it('formata em en-US', () => {
    expect(formatDate('2026-03-15T12:00:00.000Z')).toBe('March 15, 2026');
  });

  it('devolve string vazia sem data', () => {
    expect(formatDate(undefined)).toBe('');
    expect(formatDate('')).toBe('');
  });
});
