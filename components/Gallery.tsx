'use client';

import { useState } from 'react';
import Image from 'next/image';

const CATEGORIES = ['Digital', 'Painting', 'Sketches'];

interface Artwork {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string; 
  date: string; 
  src: string;
}

interface GalleryProps {
  initialArtworks?: Artwork[];
}

export default function Gallery({ initialArtworks = [] }: GalleryProps) {
  const [activeTab, setActiveTab] = useState('All Works');
  
  const filteredArt = activeTab === 'All Works' 
    ? initialArtworks 
    : initialArtworks.filter(art => art.category === activeTab);

  return (
    <div className="w-full">
      <div className="sticky top-[72px] z-40 bg-slate-950/90 backdrop-blur-md border-b border-blue-900/10 mb-12">
        <div className="flex gap-8 overflow-x-auto no-scrollbar py-4">
          {['All Works', ...CATEGORIES].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all relative pb-2 cursor-pointer whitespace-nowrap
                ${activeTab === tab ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 animate-in fade-in slide-in-from-left-1 duration-300" />
              )}
            </button>
          ))}
        </div>
      </div>

      {filteredArt.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredArt.map((art) => (
            <div 
              key={art.id} 
              className="group relative bg-slate-900 rounded-sm overflow-hidden border border-blue-900/10 aspect-[4/5]"
            >
              <Image 
                src={art.src}
                alt={art.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                quality={90}
                className="object-cover transition-all duration-1000 group-hover:scale-105 group-hover:blur-[2px]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8 translate-y-2 group-hover:translate-y-0">
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-blue-400 text-[9px] font-black uppercase tracking-[0.3em]">
                    {art.type}
                  </span>
                  <span className="text-slate-500 text-[9px] font-mono tracking-tighter">
                    {art.date}
                  </span>
                </div>

                <h3 className="text-2xl font-light text-white tracking-wide mb-2">
                  {art.title}
                </h3>

                <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 italic font-light">
                  "{art.description}"
                </p>

                <div className="w-0 h-[1px] bg-blue-500/50 mt-6 group-hover:w-full transition-all duration-700 delay-100" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border border-dashed border-blue-900/20 rounded-lg">
          <p className="text-slate-500 text-[10px] uppercase tracking-widest italic">
            Nenhuma obra encontrada nesta categoria.
          </p>
        </div>
      )}
    </div>
  );
}