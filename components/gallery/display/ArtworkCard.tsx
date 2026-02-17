'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Artwork, getOptimizedUrl } from '../types';

const extractStoragePath = (url: string): string | null => {
  const marker = '/gallery/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.substring(idx + marker.length);
};

interface ArtworkCardProps {
  art: Artwork;
  onClick: () => void;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ArtworkCard({ art, onClick, isAdmin, onEdit, onDelete }: ArtworkCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error: dbError } = await supabase
        .from('artworks')
        .delete()
        .eq('id', art.id);
      if (dbError) throw dbError;

      const path = extractStoragePath(art.image_url);
      if (path) await supabase.storage.from('gallery').remove([path]);

      onDelete?.();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <>
      <div
        className="group cursor-pointer break-inside-avoid mb-8 relative"
        onClick={onClick}
      >
        {isAdmin && (
          <div className="absolute top-3 right-3 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              className="p-2.5 bg-slate-900/90 hover:bg-blue-600 text-white rounded-xl transition-all border border-white/10 backdrop-blur-md shadow-xl cursor-pointer"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setConfirming(true); }}
              className="p-2.5 bg-slate-900/90 hover:bg-red-600 text-white rounded-xl transition-all border border-white/10 backdrop-blur-md shadow-xl cursor-pointer"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}

        <div className="relative overflow-hidden rounded-xl bg-slate-900 transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]">
          <img
            src={getOptimizedUrl(art.image_url, 85, 800)}
            alt={art.title}
            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="mt-4 px-1">
          <h3 className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors duration-300 tracking-wide">
            {art.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold">
              {art.category}
            </span>
            <span className="w-1 h-1 bg-slate-800 rounded-full" />
            <span className="text-[9px] uppercase tracking-[0.2em] text-blue-500/70 font-bold">
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
            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.8)' }}
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
                You're about to delete{' '}
                <span className="text-slate-300 font-medium">"{art.title}"</span>.
                The image file will also be permanently removed from storage.
              </p>
            </div>

            <div className="px-6 pb-6 flex gap-2">
              <button
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-white/8 text-slate-400 hover:text-white hover:border-white/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}