/**
 * Caminho do objeto dentro do bucket, a partir da URL publica do Supabase.
 *
 * Existiam QUATRO versoes disto espalhadas — `indexOf('/gallery/')` no
 * ArtworkCard e no useUploadLogic, `indexOf('/gallery/commissions/')` no
 * CommissionSection e um `.split('/').pop()` no EditPanel. Todas fatiavam a
 * string crua, entao:
 *
 *   - uma obra chamada `.../gallery/artworks/gallery/x.webp` cortava no lugar
 *     errado e apagava o arquivo errado;
 *   - a do avatar aceitava QUALQUER url que contivesse "perfil" em qualquer
 *     posicao, inclusive num dominio de terceiro;
 *   - nenhuma tirava os parametros de transformacao (`?width=`), que o
 *     `getOptimizedUrl` gruda na url.
 *
 * Aqui o caminho sai do `pathname` ja parseado, conferindo o prefixo inteiro
 * que o Storage usa. Url que nao for daquele bucket devolve `null`, e quem
 * chama simplesmente nao apaga nada — que e o certo quando nao se sabe o alvo.
 */

/** Url de objeto publico e a variante com transformacao de imagem. */
const PREFIXOS_PUBLICOS = ['/storage/v1/object/public/', '/storage/v1/render/image/public/'];

export function storagePathFromPublicUrl(url: string | null | undefined, bucket: string): string | null {
  if (!url) return null;

  let pathname: string;
  try {
    pathname = new URL(url).pathname;
  } catch {
    return null;
  }

  for (const prefixo of PREFIXOS_PUBLICOS) {
    const inicio = `${prefixo}${bucket}/`;
    if (!pathname.startsWith(inicio)) continue;

    // O pathname vem percent-encoded; o SDK do Storage espera o caminho cru.
    const caminho = decodeURIComponent(pathname.slice(inicio.length));
    return caminho.length > 0 ? caminho : null;
  }

  return null;
}
