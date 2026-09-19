import { describe, expect, it } from 'vitest';
import { storagePathFromPublicUrl } from '@/lib/storagePaths';

const HOST = 'https://projeto.supabase.co';
const publica = (caminho: string) => `${HOST}/storage/v1/object/public/${caminho}`;

describe('storagePathFromPublicUrl', () => {
  it('devolve o caminho dentro do bucket', () => {
    expect(storagePathFromPublicUrl(publica('gallery/artworks/abc.webp'), 'gallery')).toBe('artworks/abc.webp');
    expect(storagePathFromPublicUrl(publica('gallery/commissions/abc.webp'), 'gallery')).toBe('commissions/abc.webp');
    expect(storagePathFromPublicUrl(publica('perfil/avatar.webp'), 'perfil')).toBe('avatar.webp');
  });

  it('ignora os parametros de transformacao que o getOptimizedUrl gruda', () => {
    const comParametros = `${publica('gallery/artworks/abc.webp')}?width=800&quality=82&format=webp`;
    expect(storagePathFromPublicUrl(comParametros, 'gallery')).toBe('artworks/abc.webp');
  });

  it('aceita a url de render de imagem, nao so a de objeto', () => {
    const render = `${HOST}/storage/v1/render/image/public/gallery/artworks/abc.webp`;
    expect(storagePathFromPublicUrl(render, 'gallery')).toBe('artworks/abc.webp');
  });

  it('nao confunde bucket com um trecho do caminho', () => {
    // A versao antiga fatiava no primeiro '/gallery/' que achasse na string e
    // devolveria 'x.webp' aqui, apagando o arquivo errado.
    const url = publica('perfil/gallery/x.webp');
    expect(storagePathFromPublicUrl(url, 'gallery')).toBeNull();
    expect(storagePathFromPublicUrl(url, 'perfil')).toBe('gallery/x.webp');
  });

  it('recusa url de outro bucket', () => {
    expect(storagePathFromPublicUrl(publica('outro/abc.webp'), 'gallery')).toBeNull();
  });

  it('recusa url que nao e do Storage', () => {
    // A versao antiga do avatar aceitava qualquer url contendo "perfil".
    expect(storagePathFromPublicUrl('https://exemplo.com/perfil/avatar.webp', 'perfil')).toBeNull();
    expect(storagePathFromPublicUrl('https://exemplo.com/?x=/perfil/a.webp', 'perfil')).toBeNull();
  });

  it('decodifica o caminho, porque o SDK espera o nome cru', () => {
    expect(storagePathFromPublicUrl(publica('gallery/artworks/arte%20final.webp'), 'gallery'))
      .toBe('artworks/arte final.webp');
  });

  it('devolve null para entrada vazia, nula ou invalida', () => {
    expect(storagePathFromPublicUrl('', 'gallery')).toBeNull();
    expect(storagePathFromPublicUrl(null, 'gallery')).toBeNull();
    expect(storagePathFromPublicUrl(undefined, 'gallery')).toBeNull();
    expect(storagePathFromPublicUrl('nao e uma url', 'gallery')).toBeNull();
    // Prefixo do bucket sem arquivo nenhum depois.
    expect(storagePathFromPublicUrl(publica('gallery/'), 'gallery')).toBeNull();
  });
});
