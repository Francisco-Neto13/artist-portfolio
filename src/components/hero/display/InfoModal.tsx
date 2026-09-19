'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Languages, Palette } from 'lucide-react';
import { ProfileData } from '@/lib/profileTypes';

interface InfoModalProps {
  type: 'languages' | 'hobbies';
  profile: ProfileData;
  onClose: () => void;
}

export default function InfoModal({ type, profile, onClose }: InfoModalProps) {
  const items = profile[type] || [];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'unset';
    };
  }, []);

  const aoTeclar = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aoTeclar]);

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={type}
      className="fixed inset-0 z-[600] flex items-center justify-center p-6"
    >
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" onClick={onClose} />
      <div
        className="relative bg-slate-900/90 border border-white/[0.06] w-full max-w-sm rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.8)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              {type === 'languages' ? <Languages size={15} /> : <Palette size={15} />}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{type}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all cursor-pointer">
            <X size={14} />
          </button>
        </div>

        <div className="px-6 py-5 max-h-[50vh] overflow-y-auto divide-y divide-white/[0.04]" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(59,130,246,0.2) transparent' }}>
          {items.length > 0 ? (
            items.map((item, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                <span className="text-slate-200 text-sm font-semibold tracking-wide">{item.label}</span>
                <span className="text-blue-400/70 text-xs shrink-0">{item.status}</span>
              </div>
            ))
          ) : (
            <p className="text-slate-700 text-[10px] uppercase tracking-widest text-center py-8">Nothing added yet</p>
          )}
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  /**
   * Portal para o <body>, nao no lugar onde o componente aparece na arvore.
   *
   * `fixed` sozinho nao bastava: o Hero e envolvido por `.animate-reveal`, cuja
   * animacao tem `forwards` e termina com `transform: matrix(1,0,0,1,0,0)` e
   * `filter: blur(0px)`. Os dois sao visualmente nulos, mas qualquer transform
   * ou filter diferente de `none` faz o elemento virar o BLOCO DE CONTENCAO dos
   * descendentes `fixed` — e o painel passava a se posicionar em relacao ao
   * Hero, nao a viewport. Media: ao rolar 900px, ele subia os 900px junto.
   *
   * O ArtworkLightbox ja fazia assim, por isso nunca sofreu do mesmo.
   */
  return createPortal(content, document.body);
}
