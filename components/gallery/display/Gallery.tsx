'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Artwork, CATEGORIES } from '@/components/gallery/types';
import UploadModal from '@/components/gallery/management/UploadModal';
import ArtworkCard from '@/components/gallery/display/ArtworkCard';
import ArtworkLightbox from '@/components/gallery/display/ArtworkLightbox';

export default function Gallery() {
  const [activeTab, setActiveTab] = useState('All Works');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const fetchArtworks = async () => {
    const { data, error } = await supabase.from('artworks').select('*').order('created_at', { ascending: false });
    if (!error && data) setArtworks(data);
  };

  useEffect(() => {
    fetchArtworks();
    supabase.auth.getSession().then(({ data: { session } }) => setIsAdmin(!!session));
  }, []);

  const filteredArt = activeTab === 'All Works' ? artworks : artworks.filter(art => art.category === activeTab);

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? (selectedIndex + 1) % filteredArt.length 
      : (selectedIndex - 1 + filteredArt.length) % filteredArt.length;
    setSelectedIndex(newIndex);
    setSelectedArtwork(filteredArt[newIndex]);
  };

  useEffect(() => {
    if (!selectedArtwork) {
      document.body.style.overflow = 'auto';
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedArtwork(null);
      if (e.key === 'ArrowRight') handleNavigate('next');
      if (e.key === 'ArrowLeft') handleNavigate('prev');
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [selectedArtwork, selectedIndex]);

  return (
    <div className="w-full relative">
      <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-blue-900/10 mb-12">
        <div className="flex gap-8 overflow-x-auto no-scrollbar py-6 justify-center">
          {['All Works', ...CATEGORIES].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all relative pb-2 cursor-pointer whitespace-nowrap ${
                activeTab === tab ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 animate-in fade-in duration-300" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-reveal delay-2">
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="aspect-[4/5] rounded-xl border-2 border-dashed border-blue-900/20 flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 transition-all bg-blue-500/5 cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full border border-blue-500/30 flex items-center justify-center text-blue-500 text-4xl font-light">+</div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Nova Obra</span>
          </button>
        )}

        {filteredArt.map((art, index) => (
          <ArtworkCard 
            key={art.id} 
            art={art} 
            index={index} 
            onClick={() => { setSelectedArtwork(art); setSelectedIndex(index); }} 
          />
        ))}
      </div>

      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchArtworks} />

      {selectedArtwork && (
        <ArtworkLightbox 
          artwork={selectedArtwork} 
          index={selectedIndex} 
          total={filteredArt.length} 
          onClose={() => setSelectedArtwork(null)} 
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}