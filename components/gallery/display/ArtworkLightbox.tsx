'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom'; 
import { Artwork } from '../types';
import { getOptimizedUrl, formatDate } from '@/lib/imageUtils';

interface LightboxProps {
  artwork: Artwork;
  index: number;
  total: number;
  onClose: () => void;
  onNavigate: (dir: 'prev' | 'next') => void;
}

export default function ArtworkLightbox({ artwork, index, total, onClose, onNavigate }: LightboxProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      setMounted(false);
      document.body.style.overflow = 'unset';
    };
  }, []);

  const content = (
    <div 
      className="fixed inset-0 z-[99999] bg-slate-950/98 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl bg-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full p-4 z-20 flex justify-end pointer-events-none">
          <button 
            onClick={onClose} 
            className="pointer-events-auto flex items-center gap-2 px-3 py-2 bg-slate-950/80 hover:bg-red-500/20 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer backdrop-blur-md"
          >
            <span className="text-[10px] uppercase tracking-widest font-bold">Close</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="relative w-full h-[60vh] md:h-[70vh] bg-black/40 flex items-center justify-center overflow-hidden p-4 md:p-10">
          <img 
            src={getOptimizedUrl(artwork.image_url, 95, 1600)} 
            alt={artwork.title}
            className="max-w-full max-h-full object-contain shadow-2xl select-none"
          />
          
          {total > 1 && (
            <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
              <button 
                onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }} 
                className="pointer-events-auto w-12 h-12 rounded-full bg-slate-900/60 hover:bg-blue-600 text-white transition-all flex items-center justify-center cursor-pointer border border-white/10 shadow-xl group"
              >
                <svg className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onNavigate('next'); }} 
                className="pointer-events-auto w-12 h-12 rounded-full bg-slate-900/60 hover:bg-blue-600 text-white transition-all flex items-center justify-center cursor-pointer border border-white/10 shadow-xl group"
              >
                <svg className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8 bg-slate-900 border-t border-slate-700/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl md:text-2xl font-bold text-white leading-tight tracking-wide">{artwork.title}</h2>
                <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[9px] text-blue-400 font-black tracking-widest uppercase">
                  {artwork.category}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                <span className="text-blue-500/70">{artwork.type}</span> 
                <span className="mx-2 text-slate-800">•</span> 
                {formatDate(artwork.created_at)}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="px-4 py-1.5 bg-slate-950 border border-slate-800 rounded-full text-[10px] font-mono text-slate-400 tracking-tighter">
                {index + 1} <span className="text-slate-700 mx-1">/</span> {total}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(content, document.body);
}