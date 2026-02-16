'use client';
import { Artwork, getOptimizedUrl } from '../types';

interface ArtworkCardProps {
  art: Artwork;
  onClick: () => void;
  isAdmin?: boolean;
  onEdit?: () => void;
}

export default function ArtworkCard({ art, onClick, isAdmin, onEdit }: ArtworkCardProps) {
  return (
    <div 
      className="group cursor-pointer break-inside-avoid mb-8 relative" 
      onClick={onClick}
    >
      {isAdmin && (
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            onEdit?.(); 
          }}
          className="absolute top-3 right-3 z-20 p-2.5 bg-slate-900/90 hover:bg-blue-600 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all border border-white/10 backdrop-blur-md shadow-xl cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
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
  );
}