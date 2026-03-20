'use client';
import Image from 'next/image';
import { Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { Commission } from '../types';
import { getOptimizedUrl } from '@/lib/imageUtils'; 

interface CommissionCardProps {
  commission: Commission;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CommissionCard({ commission, isAdmin, onEdit, onDelete }: CommissionCardProps) {
  return (
    <div className="group relative flex flex-col bg-gradient-to-b from-slate-900/60 to-slate-900/40 border border-white/[0.06] rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all duration-500 shadow-2xl h-full w-full max-w-[450px] mx-auto">
      
      {isAdmin && (
        <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20 flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
          <button 
            onClick={onEdit}
            className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-slate-900/90 border border-white/10 hover:bg-blue-600 hover:border-blue-500 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer shadow-xl backdrop-blur-sm"
          >
            <Pencil size={13} />
          </button>
          <button 
            onClick={onDelete}
            className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-slate-900/90 border border-white/10 hover:bg-red-600 hover:border-red-500 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer shadow-xl backdrop-blur-sm"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}

      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950 shrink-0">
        {commission.image_url ? (
          <Image 
            src={getOptimizedUrl(commission.image_url, 85, 800)} 
            alt={commission.title} 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900">
            <ImageIcon size={40} className="text-slate-800" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
      </div>

      <div className="p-5 md:p-8 flex flex-col flex-grow relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        
        <div className="flex justify-between items-start mb-3 md:mb-4 gap-3 shrink-0">
          <h3 className="text-base md:text-xl font-bold text-white tracking-tight leading-tight">
            {commission.title}
          </h3>
          <div className="shrink-0 px-2.5 py-1 bg-blue-600/10 border border-blue-500/20 rounded-lg">
            <span className="text-blue-400 font-black text-xs md:text-sm tracking-wide">
              ${commission.price}
            </span>
          </div>
        </div>

        <div className="flex-grow">
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-words italic opacity-90">
            {commission.description}
          </p>
        </div>
      </div>
    </div>
  );
}