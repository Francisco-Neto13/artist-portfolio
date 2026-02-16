'use client';
import Image from 'next/image';
import { Artwork, getOptimizedUrl, formatDate } from '../types';

interface CardProps {
  art: Artwork;
  index: number;
  onClick: () => void;
}

export default function ArtworkCard({ art, index, onClick }: CardProps) {
  return (
    <div 
      onClick={onClick}
      className="group relative bg-slate-900/50 rounded-xl overflow-hidden border border-blue-900/20 p-2 transition-all hover:border-blue-500/40 cursor-zoom-in"
      style={{ animation: `fadeInScale 0.6s ease-out ${index * 0.08}s both` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-slate-950">
        <Image 
          src={getOptimizedUrl(art.image_url)}
          alt={art.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-all duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent opacity-0 group-hover:opacity-100 transition-all p-6 flex flex-col justify-end">
          <div className="flex justify-between items-center mb-1">
            <span className="text-blue-400 text-[8px] font-black uppercase tracking-widest">{art.type}</span>
          </div>
          <h3 className="text-lg font-light text-white">{art.title}</h3>
          <p className="text-slate-400 text-[9px] italic mt-1 line-clamp-1">"{art.description}"</p>
        </div>
      </div>
    </div>
  );
}