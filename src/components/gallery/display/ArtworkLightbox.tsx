'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Artwork } from '../types';
import { getOptimizedUrl, getOriginalImageUrl, formatDate } from '@/lib/imageUtils';

interface LightboxProps {
  artwork: Artwork;
  index: number;
  total: number;
  onClose: () => void;
  onNavigate: (dir: 'prev' | 'next') => void;
}

/** Mesma largura pedida pelo card: e esta que ja esta no cache do navegador. */
const LARGURA_CARD = 800;
const QUALIDADE_CARD = 85;
/**
 * O dobro da largura do card, para telas retina.
 *
 * Qualidade 88 e nao 95: medido numa obra de 2048px, 95 devolve 257 KB contra
 * 156 KB de 88 — 65% a mais por diferenca que nao se enxerga num WebP. A 82
 * cairia para 120 KB, mas ai comeca a aparecer banda em gradiente, que estas
 * artes tem bastante.
 */
const LARGURA_CHEIA = 1600;
const QUALIDADE_CHEIA = 88;

function ArtworkLightboxImage({
  artwork,
}: {
  artwork: Artwork;
}) {
  const daGrade = getOptimizedUrl(artwork.image_url, QUALIDADE_CARD, LARGURA_CARD);
  const cheia = getOptimizedUrl(artwork.image_url, QUALIDADE_CHEIA, LARGURA_CHEIA);

  /**
   * Comeca pela MESMA url que o card usou.
   *
   * O card pede width=800 e o lightbox pedia width=1600: urls diferentes, logo
   * entradas de cache diferentes, logo download inteiro de novo — por isso a
   * arte "recarregava" ao ser clicada, mesmo ja estando na tela. Agora a versao
   * do card aparece na hora (veio do cache) e a de alta resolucao entra por
   * cima quando termina de decodificar.
   */
  const [src, setSrc] = useState(daGrade);

  useEffect(() => {
    let ativo = true;
    const img = new Image();
    img.src = cheia;

    // `decode()` espera a imagem estar PRONTA para pintar. Sem isso a troca de
    // src pisca um branco no meio do caminho.
    const pronta = img.decode ? img.decode() : Promise.resolve();
    pronta
      .then(() => { if (ativo) setSrc(cheia); })
      .catch(() => { /* fica com a do card, que ja esta boa */ });

    return () => { ativo = false; };
  }, [cheia]);

  const proporcao = artwork.width && artwork.height
    ? `${artwork.width} / ${artwork.height}`
    : undefined;

  return (
    <>
      {/* <img> cru, nao next/image: o onError precisa trocar a src quando a URL */}
      {/* otimizada do Supabase falha (Firefox). Ver getOriginalImageUrl. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={artwork.title}
        width={artwork.width ?? undefined}
        height={artwork.height ?? undefined}
        style={{ aspectRatio: proporcao }}
        onError={() => {
          const reserva = getOriginalImageUrl(artwork.image_url);
          if (src !== reserva) setSrc(reserva);
        }}
        // A imagem manda no tamanho da moldura: `w-auto h-auto` com os dois
        // limites faz o container encolher ate ela, em vez de ela boiar dentro
        // de uma caixa fixa.
        //
        // O `10rem`/`12rem` e a calha das setas (elas ficam presas na borda da
        // tela): sem reservar esse espaco, uma obra bem larga passaria por
        // baixo dos botoes. Sao 12rem a partir de `md` porque ali a seta
        // tambem se afasta da borda (`md:left-6`), e com 10rem a folga caia
        // para 12px numa tela de 768px.
        className="block w-auto h-auto max-w-[min(92vw,1400px)] sm:max-w-[min(calc(100vw-10rem),1400px)] md:max-w-[min(calc(100vw-12rem),1400px)] max-h-[82vh] object-contain rounded-lg select-none"
      />
    </>
  );
}

export default function ArtworkLightbox({ artwork, index, total, onClose, onNavigate }: LightboxProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mountTimer = window.setTimeout(() => setMounted(true), 0);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(mountTimer);
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Teclado: um visualizador de imagem sem Esc e sem setas obriga a mirar o
  // mouse num botao para cada troca de arte.
  const aoTeclar = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (total > 1 && e.key === 'ArrowLeft') onNavigate('prev');
    if (total > 1 && e.key === 'ArrowRight') onNavigate('next');
  }, [onClose, onNavigate, total]);

  useEffect(() => {
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aoTeclar]);

  const botaoNav =
    'pointer-events-auto w-11 h-11 rounded-full bg-slate-900/70 hover:bg-blue-600 text-white ' +
    'transition-all flex items-center justify-center cursor-pointer border border-white/10 ' +
    'shadow-xl backdrop-blur-md shrink-0';

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={artwork.title}
      className="fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-2 bg-slate-900/70 hover:bg-red-500/20 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer backdrop-blur-md"
      >
        <span className="text-[10px] uppercase tracking-widest font-bold">Close</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      {/*
        Setas ancoradas na BORDA DA TELA, nao ao lado da imagem.
        Antes elas eram irmas do <figure> num flex-row, entao a largura da obra
        decidia onde elas caiam — trocar de uma arte estreita para uma larga
        movia o botao para longe do cursor no meio do clique. Presas aqui, dao
        para clicar varias vezes seguidas sem tirar o mouse do lugar.
      */}
      {total > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
            aria-label="Previous artwork"
            className={`${botaoNav} hidden sm:flex absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-10`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
            aria-label="Next artwork"
            className={`${botaoNav} hidden sm:flex absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-10`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}

      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        {/*
          Sem caixa de largura fixa. Antes era um `max-w-5xl` com area de imagem
          de `h-[70vh]`: uma obra em retrato (0.75) ocupava ~475px dentro de
          1024px, e sobrava meia tela de preto dos dois lados. A moldura
          competia com a arte em vez de emoldura-la.
        */}
        <figure className="flex flex-col items-center min-w-0 m-0">
          <ArtworkLightboxImage key={artwork.image_url} artwork={artwork} />

          {/* Legenda com a largura da imagem, nao a da tela. */}
          <figcaption className="w-full mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base md:text-lg font-bold text-white leading-tight tracking-wide">{artwork.title}</h2>
                <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[9px] text-blue-400 font-black tracking-widest uppercase">
                  {artwork.category}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-1">
                <span className="text-blue-500/70">{artwork.type}</span>
                <span className="mx-2 text-slate-700">|</span>
                {formatDate(artwork.created_at)}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {total > 1 && (
                <div className="flex sm:hidden items-center gap-2">
                  <button onClick={() => onNavigate('prev')} aria-label="Previous artwork" className={`${botaoNav} w-9 h-9`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button onClick={() => onNavigate('next')} aria-label="Next artwork" className={`${botaoNav} w-9 h-9`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}
              <div className="px-3 py-1 bg-white/[0.04] border border-white/[0.06] rounded-full text-[10px] font-mono text-slate-400 tracking-tighter">
                {index + 1} <span className="text-slate-700 mx-0.5">/</span> {total}
              </div>
            </div>
          </figcaption>
        </figure>

      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(content, document.body);
}
