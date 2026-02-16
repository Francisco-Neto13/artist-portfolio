'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Artwork, CATEGORIES } from '@/components/gallery/types';
import UploadModal from '@/components/gallery/management/UploadModal';
import ArtworkCard from '@/components/gallery/display/ArtworkCard';
import ArtworkLightbox from '@/components/gallery/display/ArtworkLightbox';

export default function Gallery() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedType, setSelectedType] = useState('All Themes');
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const fetchArtworks = async () => {
    const { data } = await supabase.from('artworks').select('*').order('created_at', { ascending: false });
    if (data) setArtworks(data);
  };

  useEffect(() => {
    fetchArtworks();
    supabase.auth.getSession().then(({ data: { session } }) => setIsAdmin(!!session));
    supabase.from('artwork_types').select('name').then(({ data }) => {
      if (data) setAvailableTypes(data.map(t => t.name));
    });
  }, []);

  const filteredArt = artworks.filter(art => {
    const catMatch = selectedCategory === 'All Categories' || art.category === selectedCategory;
    const typeMatch = selectedType === 'All Themes' || art.type === selectedType;
    return catMatch && typeMatch;
  });

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? (selectedIndex + 1) % filteredArt.length 
      : (selectedIndex - 1 + filteredArt.length) % filteredArt.length;
    setSelectedIndex(newIndex);
    setSelectedArtwork(filteredArt[newIndex]);
  };

  return (
    <div className="w-full relative min-h-screen bg-slate-950">
      <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 mb-12">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex gap-6 overflow-x-auto no-scrollbar">
            {['All Categories', ...CATEGORIES].map(cat => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)} 
                className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative pb-2 cursor-pointer ${
                  selectedCategory === cat ? 'text-blue-500' : 'text-slate-500 hover:text-white'
                }`}
              >
                {cat}
                {selectedCategory === cat && <span className="absolute bottom-0 left-0 w-full h-px bg-blue-500" />}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <span className="text-[9px] text-slate-500 font-black uppercase">Theme:</span>
            <select 
              value={selectedType} 
              onChange={e => setSelectedType(e.target.value)} 
              className="bg-transparent text-[10px] text-blue-400 font-bold uppercase outline-none cursor-pointer"
            >
              <option value="All Themes" className="bg-slate-900">All</option>
              {availableTypes.map(t => (
                <option key={t} value={t} className="bg-slate-900">{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 px-6 max-w-7xl mx-auto">
        {isAdmin && (
          <button 
            onClick={() => { setEditingArtwork(null); setIsModalOpen(true); }} 
            className="w-full aspect-video mb-8 rounded-xl border-2 border-dashed border-blue-500/20 flex flex-col items-center justify-center gap-3 hover:bg-blue-500/5 hover:border-blue-500/50 transition-all group break-inside-avoid cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full border border-blue-500/30 flex items-center justify-center text-blue-500 text-xl font-light group-hover:scale-110 transition-transform">
              +
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400">Add Artwork</span>
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

      <UploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchArtworks} 
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
    </div>
  );
}
