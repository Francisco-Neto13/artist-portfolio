'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Artwork, ArtworkCategory, ArtworkType } from '@/components/gallery/types';
import UploadModal from '@/components/gallery/management/UploadModal';
import MetadataManager from '@/components/gallery/management/MetadataManager'; 
import ArtworkCard from '@/components/gallery/display/ArtworkCard';
import ArtworkLightbox from '@/components/gallery/display/ArtworkLightbox';

export default function Gallery() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedType, setSelectedType] = useState('All Themes');
  const [dbCategories, setDbCategories] = useState<ArtworkCategory[]>([]);
  const [dbTypes, setDbTypes] = useState<ArtworkType[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [managerConfig, setManagerConfig] = useState<{ open: boolean, type: 'category' | 'theme' }>({ open: false, type: 'category' });

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

  const handleNavigate = (direction: 'prev' | 'next') => {
    const filteredArt = artworks.filter(art => {
      const catMatch = selectedCategory === 'All Categories' || art.category === selectedCategory;
      const typeMatch = selectedType === 'All Themes' || art.type === selectedType;
      return catMatch && typeMatch;
    });
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
    const mDown = (e: MouseEvent) => { isDown = true; startX = e.pageX - slider.offsetLeft; scrollLeft = slider.scrollLeft; };
    const mLeave = () => { isDown = false; };
    const mUp = () => { isDown = false; };
    const mMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      slider.scrollLeft = scrollLeft - (x - startX) * 2;
    };
    slider.addEventListener('mousedown', mDown);
    slider.addEventListener('mouseleave', mLeave);
    slider.addEventListener('mouseup', mUp);
    slider.addEventListener('mousemove', mMove);
    return () => {
      slider.removeEventListener('mousedown', mDown);
      slider.removeEventListener('mouseleave', mLeave);
      slider.removeEventListener('mouseup', mUp);
      slider.removeEventListener('mousemove', mMove);
    };
  }, []);

  const filteredArt = artworks.filter(art => {
    const catMatch = selectedCategory === 'All Categories' || art.category === selectedCategory;
    const typeMatch = selectedType === 'All Themes' || art.type === selectedType;
    return catMatch && typeMatch;
  });

  return (
    <div className="w-full relative min-h-screen bg-slate-950">
      
      <div className="relative bg-slate-950 border-b border-white/5 w-full">
        <div className="max-w-7xl mx-auto px-6 py-10 flex items-center gap-10">
          
          {isAdmin && (
            <div className="flex items-center pr-8 border-r border-white/10 shrink-0">
              <button 
                onClick={() => setManagerConfig({ open: true, type: 'category' })}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-blue-600 hover:text-white transition-all cursor-pointer text-slate-500 shadow-2xl group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">✎</span>
              </button>
            </div>
          )}

          <div className="flex flex-col gap-6 grow overflow-hidden">
            
            <div 
              ref={scrollRef}
              className="flex items-center gap-10 overflow-x-auto select-none cursor-grab active:cursor-grabbing gallery-scrollbar pb-2"
            >
              {['All Categories', ...dbCategories.map(c => c.name)].map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)} 
                  className={`text-[12px] font-black uppercase tracking-[0.25em] transition-all relative pb-2 cursor-pointer whitespace-nowrap shrink-0 ${
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

            <div className="flex items-center gap-3 overflow-x-auto gallery-scrollbar pb-2 pr-20">
              {['All Themes', ...dbTypes.map(t => t.name)].map(type => (
                <button 
                  key={type} 
                  onClick={() => setSelectedType(type)} 
                  className={`text-[9px] font-bold uppercase tracking-[0.12em] px-5 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
                    selectedType === type 
                    ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' 
                    : 'border-white/5 bg-white/[0.01] text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-950 via-slate-950/20 to-transparent pointer-events-none z-10" />
        </div>
      </div>

      <main className="mt-16 max-w-7xl mx-auto px-6 pb-24">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-10">
          {isAdmin && (
            <button 
              onClick={() => { setEditingArtwork(null); setIsModalOpen(true); }} 
              className="w-full aspect-video mb-10 rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 hover:bg-blue-500/[0.03] hover:border-blue-500/20 transition-all group break-inside-avoid cursor-pointer bg-white/[0.01]"
            >
              <div className="w-14 h-14 rounded-full border border-blue-500/20 flex items-center justify-center text-blue-500 text-3xl font-light group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                +
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 group-hover:text-blue-400">Add Artwork</span>
            </button>
          )}

          {filteredArt.map((art, index) => (
            <ArtworkCard 
              key={art.id} 
              art={art} 
              isAdmin={isAdmin}
              onEdit={() => { setEditingArtwork(art); setIsModalOpen(true); }}
              onClick={() => { setSelectedArtwork(art); setSelectedIndex(index); }} 
            />
          ))}
        </div>
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
        onSuccess={() => { fetchArtworks(); fetchMetadata(); }} 
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
        .gallery-scrollbar::-webkit-scrollbar {
          height: 2px;
        }
        .gallery-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .gallery-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.25);
          border-radius: 999px;
        }
        .gallery-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }
        .gallery-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(59, 130, 246, 0.25) transparent;
        }
      `}</style>
    </div>
  );
}