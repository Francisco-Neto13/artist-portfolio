'use client';
import { useRef } from 'react';
import { Pencil } from 'lucide-react';
import { ArtworkCategory, ArtworkType } from '@/components/gallery/types';
import StorageMeter from '@/components/gallery/management/StorageMeter';

interface GalleryFiltersProps {
  categories: ArtworkCategory[];
  types: ArtworkType[];
  selectedCategory: string;
  selectedType: string;
  searchQuery: string;
  filteredCount: number;
  isAdmin: boolean;
  storageRefresh: number;
  onCategoryChange: (cat: string) => void;
  onTypeChange: (type: string) => void;
  onSearchChange: (q: string) => void;
  onOpenManager: () => void;
}

export default function GalleryFilters({
  categories, types, selectedCategory, selectedType,
  searchQuery, filteredCount, isAdmin, storageRefresh,
  onCategoryChange, onTypeChange, onSearchChange, onOpenManager
}: GalleryFiltersProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="relative bg-white/[0.02] border-y md:border border-white/5 md:rounded-3xl p-4 md:p-8 mb-6 md:mb-16 shadow-2xl">
        <div className="flex items-start gap-6">
          {isAdmin && (
            <div className="hidden md:flex items-center pr-8 border-r border-white/10 shrink-0 pt-1">
              <button
                onClick={onOpenManager}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-blue-600 hover:text-white transition-all cursor-pointer text-slate-500 group"
              >
                <Pencil size={18} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          )}

          <div className="flex flex-col gap-4 md:gap-5 grow overflow-hidden">
            <div
              ref={scrollRef}
              className="flex items-center gap-5 md:gap-10 overflow-x-auto select-none cursor-grab active:cursor-grabbing gallery-scrollbar pb-2"
            >
              {['All Categories', ...categories.map(c => c.name)].map(cat => (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  className={`text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em] md:tracking-[0.25em] transition-all relative pb-2 cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedCategory === cat ? 'text-white' : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  {cat}
                  {selectedCategory === cat && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)]" />
                  )}
                </button>
              ))}
            </div>

            <div className="h-px bg-white/5 md:hidden" />

            <div className="flex items-center gap-2 md:gap-3 overflow-x-auto gallery-scrollbar pb-2">
              {['All Themes', ...types.map(t => t.name)].map(type => (
                <button
                  key={type}
                  onClick={() => onTypeChange(type)}
                  className={`text-[9px] font-bold uppercase tracking-[0.12em] px-3 md:px-5 py-1.5 md:py-2 rounded-full transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
                    selectedType === type
                      ? 'bg-blue-600/10 border-blue-500/50 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                      : 'border-white/5 bg-white/[0.01] text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-3 md:pt-2 border-t border-white/5">
              <div className="relative flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search artworks..."
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 placeholder:text-slate-700 outline-none focus:border-blue-500/30 focus:bg-white/[0.04] transition-all"
                />
              </div>
              <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest shrink-0">
                {filteredCount} <span className="hidden md:inline">Pieces </span>Found
              </span>
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="mb-10 md:mb-16">
          <StorageMeter refreshTrigger={storageRefresh} />
        </div>
      )}
    </>
  );
}