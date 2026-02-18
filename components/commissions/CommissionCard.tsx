'use client';

import Image from 'next/image';
import { Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { Commission } from './types';

interface CommissionCardProps {
  commission: Commission;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CommissionCard({ commission, isAdmin, onEdit, onDelete }: CommissionCardProps) {
  return (
    <div className="group relative flex flex-col bg-gradient-to-b from-slate-900/60 to-slate-900/40 border border-white/[0.06] rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all duration-500 shadow-2xl h-full">
      
      {isAdmin && (
        <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <button 
            onClick={onEdit}
            className="w-9 h-9 rounded-xl bg-slate-900/90 border border-white/10 hover:bg-blue-600 hover:border-blue-500 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer shadow-xl backdrop-blur-sm"
          >
            <Pencil size={14} />
          </button>
          <button 
            onClick={onDelete}
            className="w-9 h-9 rounded-xl bg-slate-900/90 border border-white/10 hover:bg-red-600 hover:border-red-500 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer shadow-xl backdrop-blur-sm"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950 shrink-0">
        {commission.image_url ? (
          <Image 
            src={commission.image_url} 
            alt={commission.title} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-700" 
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900">
            <ImageIcon size={48} className="text-slate-800" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
      </div>

      <div className="p-8 flex flex-col flex-grow relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

        <div className="flex justify-between items-start mb-4 gap-4 shrink-0">
          <h3 className="text-xl font-bold text-white tracking-tight">{commission.title}</h3>
          <div className="shrink-0 px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-lg">
            <span className="text-blue-400 font-black text-sm tracking-wide">${commission.price}</span>
          </div>
        </div>

        <div className="flex-grow">
          <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap break-words">
            {commission.description}
          </p>
        </div>
      </div>
    </div>
  );
}