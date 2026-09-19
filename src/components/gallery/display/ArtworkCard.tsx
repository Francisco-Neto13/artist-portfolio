'use client';
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Artwork } from '../types';
import { getOptimizedUrl, getOriginalImageUrl } from '@/lib/imageUtils';
import { storagePathFromPublicUrl } from '@/lib/storagePaths';
import { mensagemDeErro, useToast } from '@/components/providers/ToastProvider';

interface ArtworkCardProps {
  art: Artwork;
  onClick: () => void;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

function ArtworkCardImage({
  imageUrl,
  title,
  width,
  height,
}: {
  imageUrl: string;
  title: string;
  width?: number | null;
  height?: number | null;
}) {
  const [imageSrc, setImageSrc] = useState(() => getOptimizedUrl(imageUrl, 85, 800));
  const [carregada, setCarregada] = useState(false);

  /**
   * Confere `complete` assim que o <img> entra no DOM.
   *
   * ⚠️ `onLoad` sozinho NAO basta. Quando a imagem vem do cache do navegador
   * — um F5, por exemplo — ela termina de carregar ANTES de o React anexar o
   * handler, e o evento nunca dispara. O `carregada` ficava false para sempre
   * e o card exibia so o fundo cinza, com a arte invisivel em opacity-0 por
   * cima. Reproduzido: recarregando a home, 24 imagens completas no DOM e as
   * 24 com opacity 0.
   *
   * Cache frio nao mostrava nada disso, que e por que passou batido.
   */
  const aoMontar = useCallback((el: HTMLImageElement | null) => {
    if (el?.complete && el.naturalWidth > 0) setCarregada(true);
  }, []);

  // O espaco do card e reservado ANTES de a imagem chegar. Sem isto o card tem
  // altura zero ate o byte final, e o masonry de colunas CSS rebalanceia a
  // grade inteira a cada imagem que termina — e o embaralhamento que se ve.
  const proporcao = width && height ? `${width} / ${height}` : undefined;

  return (
    <div className="relative w-full bg-white/[0.03]" style={{ aspectRatio: proporcao }}>
      {/* <img> cru, nao next/image: o onError precisa trocar a src quando a URL */}
      {/* otimizada do Supabase falha (Firefox). Ver getOriginalImageUrl. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={aoMontar}
        src={imageSrc}
        alt={title}
        // Os atributos tambem entram na conta do navegador: mesmo sem o CSS
        // acima ele ja consegue reservar a altura sozinho.
        width={width ?? undefined}
        height={height ?? undefined}
        loading="lazy"
        decoding="async"
        onLoad={() => setCarregada(true)}
        onError={() => {
          const fallbackSrc = getOriginalImageUrl(imageUrl);
          if (imageSrc !== fallbackSrc) {
            setImageSrc(fallbackSrc);
          } else {
            // Nem o original carregou: tira o fundo de espera, que senao fica
            // um retangulo cinza para sempre.
            setCarregada(true);
          }
        }}
        className={`block w-full h-full object-cover transition-[transform,opacity] duration-700 group-hover:scale-105 ${
          carregada ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}

export default function ArtworkCard({ art, onClick, isAdmin, onEdit, onDelete }: ArtworkCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { pushToast } = useToast();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error: dbError } = await supabase.from('artworks').delete().eq('id', art.id);
      if (dbError) throw dbError;
      const path = storagePathFromPublicUrl(art.image_url, 'gallery');
      if (path) await supabase.storage.from('gallery').remove([path]);
      onDelete?.();
      pushToast('Artwork deleted.', 'warning');
    } catch (err) {
      console.error('Delete failed:', err);
      pushToast(mensagemDeErro(err, 'Could not delete this artwork.'), 'error');
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <>
      <div
        className="group cursor-pointer break-inside-avoid relative"
        onClick={onClick}
      >
        {isAdmin && (
          <div className="absolute top-2 right-2 md:top-3 md:right-3 z-20 flex gap-1.5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              className="p-1.5 md:p-2 bg-slate-900/90 hover:bg-blue-600 text-white rounded-lg md:rounded-xl transition-all border border-white/10 backdrop-blur-md cursor-pointer"
            >
              <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setConfirming(true); }}
              className="p-1.5 md:p-2 bg-slate-900/90 hover:bg-red-600 text-white rounded-lg md:rounded-xl transition-all border border-white/10 backdrop-blur-md cursor-pointer"
            >
              <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}

        <div className="relative overflow-hidden rounded-lg md:rounded-2xl bg-slate-900 transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]">
          <ArtworkCardImage key={art.image_url} imageUrl={art.image_url} title={art.title} width={art.width} height={art.height} />
        </div>

        <div className="mt-2 md:mt-3 px-1">
          <h3 className="text-[10px] md:text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors duration-300 tracking-wide truncate">
            {art.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5 md:mt-1">
            <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-slate-500 font-bold truncate">
              {art.category}
            </span>
            <span className="w-1 h-1 bg-slate-700 rounded-full shrink-0" />
            <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-blue-500/70 font-bold truncate">
              {art.type}
            </span>
          </div>
        </div>
      </div>

      {confirming && (
        <div
          className="fixed inset-0 z-[350] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-lg animate-in fade-in duration-200"
          onClick={() => !deleting && setConfirming(false)}
        >
          <div
            className="relative bg-slate-900 border border-white/[0.06] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
            <div className="p-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-white text-sm font-semibold tracking-wide mb-1">Delete artwork?</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                You&apos;re about to delete <span className="text-slate-300 font-medium">&quot;{art.title}&quot;</span>.
              </p>
            </div>
            <div className="px-6 pb-6 flex gap-2">
              <button onClick={() => setConfirming(false)} className="flex-1 py-2.5 rounded-xl border border-white/8 text-slate-400 text-[10px] font-black uppercase tracking-widest cursor-pointer">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest cursor-pointer disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
