'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Pencil } from 'lucide-react';
import { Artwork, ArtworkCategory, ArtworkType } from '@/components/gallery/types';
import UploadModal from '@/components/gallery/management/UploadModal';
import MetadataManager from '@/components/gallery/management/MetadataManager';
import ArtworkCard from '@/components/gallery/display/ArtworkCard';
import ArtworkLightbox from '@/components/gallery/display/ArtworkLightbox';
import StorageMeter from '@/components/gallery/management/StorageMeter';

export default function Gallery() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedType, setSelectedType] = useState('All Themes');
  const [searchQuery, setSearchQuery] = useState('');
  const [dbCategories, setDbCategories] = useState<ArtworkCategory[]>([]);
  const [dbTypes, setDbTypes] = useState<ArtworkType[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [managerConfig, setManagerConfig] = useState<{ open: boolean; type: 'category' | 'theme' }>({ open: false, type: 'category' });
  const [storageRefresh, setStorageRefresh] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchArtworks = async () => {
    const { data } = await supabase.from('artworks').select('*').order('created_at', { ascending: false });
    if (data) setArtworks(data);
  };

  const fetchMetadata = async () => {
    const [catRes, typeRes] = await Promise.all([
      supabase.from('artwork_categories').select('*').order('name'),
      supabase.from('artwork_types').select('*').order('name')
    ]);
    if (catRes.data) setDbCategories(catRes.data);
    if (typeRes.data) setDbTypes(typeRes.data);
  };

  useEffect(() => {
    fetchArtworks();
    fetchMetadata();
    supabase.auth.getSession().then(({ data: { session } }) => setIsAdmin(!!session));
  }, []);

  const handleAddItem = async (table: 'artwork_categories' | 'artwork_types', name: string) => {
    await supabase.from(table).insert([{ name }]);
    fetchMetadata();
  };

  const handleRemoveItem = async (table: 'artwork_categories' | 'artwork_types', id: string, name: string) => {
    const column = table === 'artwork_categories' ? 'category' : 'type';
    const { count } = await supabase.from('artworks').select('*', { count: 'exact', head: true }).eq(column, name);
    if (count && count > 0) throw new Error(`in_use:${count}`);
    await supabase.from(table).delete().eq('id', id);
    fetchMetadata();
  };

  const handleCheckCount = async (table: 'artwork_categories' | 'artwork_types', name: string): Promise<number> => {
    const column = table === 'artwork_categories' ? 'category' : 'type';
    const { count } = await supabase.from('artworks').select('*', { count: 'exact', head: true }).eq(column, name);
    return count ?? 0;
  };

  const filteredArt = artworks.filter(art => {
    const catMatch = selectedCategory === 'All Categories' || art.category === selectedCategory;
    const typeMatch = selectedType === 'All Themes' || art.type === selectedType;
    const searchMatch = searchQuery.trim() === '' || (
      art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.type?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return catMatch && typeMatch && searchMatch;
  });

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next'
      ? (selectedIndex + 1) % filteredArt.length
      : (selectedIndex - 1 + filteredArt.length) % filteredArt.length;
    setSelectedIndex(newIndex);
    setSelectedArtwork(filteredArt[newIndex]);
  };

  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;
    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const start = (pageX: number) => {
      isDown = true;
      startX = pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const end = () => { isDown = false; };

    const move = (pageX: number) => {
      if (!isDown) return;
      const x = pageX - slider.offsetLeft;
      const walk = (x - startX) * 2;
      slider.scrollLeft = scrollLeft - walk;
    };

    const mDown = (e: MouseEvent) => start(e.pageX);
    const mLeave = () => end();
    const mUp = () => end();
    const mMove = (e: MouseEvent) => move(e.pageX);

    const tStart = (e: TouchEvent) => start(e.touches[0].pageX);
    const tEnd = () => end();
    const tMove = (e: TouchEvent) => move(e.touches[0].pageX);

    slider.addEventListener('mousedown', mDown);
    slider.addEventListener('mouseleave', mLeave);
    slider.addEventListener('mouseup', mUp);
    slider.addEventListener('mousemove', mMove);
    
    slider.addEventListener('touchstart', tStart, { passive: true });
    slider.addEventListener('touchend', tEnd);
    slider.addEventListener('touchmove', tMove, { passive: true });

    return () => {
      slider.removeEventListener('mousedown', mDown);
      slider.removeEventListener('mouseleave', mLeave);
      slider.removeEventListener('mouseup', mUp);
      slider.removeEventListener('mousemove', mMove);
      slider.removeEventListener('touchstart', tStart);
      slider.removeEventListener('touchend', tEnd);
      slider.removeEventListener('touchmove', tMove);
    };
  }, []);

  return (
    <div id="gallery" className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-16 px-4 md:px-0">
        <div className="animate-reveal">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] mb-4 md:mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Visual Archive
          </div>
          <h2 className="text-3xl md:text-6xl font-bold tracking-tighter text-white">
            Selected Artworks
          </h2>
          <p className="text-slate-500 text-xs md:text-sm mt-2 md:mt-3 tracking-wide max-w-xl">
            A curated collection of digital illustrations, character designs, and concepts.
          </p>
        </div>
      </div>

      <div className="relative bg-white/[0.02] border-y md:border border-white/5 md:rounded-3xl p-4 md:p-8 mb-6 md:mb-16 shadow-2xl">
        <div className="flex items-start gap-6">
          {isAdmin && (
            <div className="hidden md:flex items-center pr-8 border-r border-white/10 shrink-0 pt-1">
              <button
                onClick={() => setManagerConfig({ open: true, type: 'category' })}
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
              {['All Categories', ...dbCategories.map(c => c.name)].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
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
              {['All Themes', ...dbTypes.map(t => t.name)].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                >
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search artworks..."
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 placeholder:text-slate-700 outline-none focus:border-blue-500/30 focus:bg-white/[0.04] transition-all"
                />
              </div>
              <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest shrink-0">
                {filteredArt.length} <span className="hidden md:inline">Pieces </span>Found
              </span>
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="mb-10 md:mb-16 px-4 md:px-0">
          <StorageMeter refreshTrigger={storageRefresh} />
        </div>
      )}

      <main className="w-full px-2 md:px-0">
        <div className="columns-2 lg:columns-3 gap-2 md:gap-8 block">
          {isAdmin && (
            <div className="break-inside-avoid inline-block w-full mb-2 md:mb-8">
              <button
                onClick={() => { setEditingArtwork(null); setIsModalOpen(true); }}
                className="w-full aspect-[4/3] rounded-xl md:rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-3 md:gap-4 hover:bg-blue-500/[0.03] hover:border-blue-500/20 transition-all group cursor-pointer bg-white/[0.01]"
              >
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-blue-500/20 flex items-center justify-center text-blue-500 text-2xl md:text-3xl font-light group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  +
                </div>
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-slate-600 group-hover:text-blue-400">Upload Art</span>
              </button>
            </div>
          )}

          {filteredArt.map((art, index) => (
            <div key={art.id} className="break-inside-avoid inline-block w-full mb-2 md:mb-8">
              <ArtworkCard
                art={art}
                isAdmin={isAdmin}
                onEdit={() => { setEditingArtwork(art); setIsModalOpen(true); }}
                onClick={() => { setSelectedArtwork(art); setSelectedIndex(index); }}
                onDelete={() => { fetchArtworks(); setStorageRefresh(n => n + 1); }}
              />
            </div>
          ))}
        </div>

        {filteredArt.length === 0 && (
          <div className="mx-2 md:mx-0 py-24 text-center border-2 border-dashed border-white/[0.02] rounded-3xl">
            <p className="text-slate-600 uppercase tracking-widest text-xs font-bold">
              {searchQuery ? `No artworks found for "${searchQuery}".` : 'No artworks found in this category.'}
            </p>
          </div>
        )}
      </main>

      <MetadataManager
        isOpen={managerConfig.open}
        onClose={() => setManagerConfig({ ...managerConfig, open: false })}
        title={managerConfig.type === 'category' ? 'Categories' : 'Themes'}
        items={managerConfig.type === 'category' ? dbCategories : dbTypes}
        onAdd={(n) => handleAddItem(managerConfig.type === 'category' ? 'artwork_categories' : 'artwork_types', n)}
        onRemove={(id, n) => handleRemoveItem(managerConfig.type === 'category' ? 'artwork_categories' : 'artwork_types', id, n)}
        onCheckCount={(_, n) => handleCheckCount(managerConfig.type === 'category' ? 'artwork_categories' : 'artwork_types', n)}
        activeType={managerConfig.type}
        onSwitchType={(type) => setManagerConfig({ open: true, type })}
      />

      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => { fetchArtworks(); fetchMetadata(); setStorageRefresh(n => n + 1); }}
        editingArtwork={editingArtwork}
      />

      {selectedArtwork && (
        <ArtworkLightbox
          artwork={selectedArtwork}
          index={selectedIndex}
          total={filteredArt.length}
          onClose={() => setSelectedArtwork(null)}
          onNavigate={handleNavigate}
        />
      )}

      <style jsx global>{`
        .gallery-scrollbar::-webkit-scrollbar { height: 2px; }
        .gallery-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .gallery-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.25); border-radius: 999px; }
        .gallery-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.5); }
        .gallery-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(59, 130, 246, 0.25) transparent; }
      `}</style>
    </div>
  );
}