'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Artwork, ArtworkCategory, ArtworkType } from '@/components/gallery/types';
import UploadModal from '@/components/gallery/management/UploadModal';
import MetadataManager from '@/components/gallery/management/MetadataManager';
import ArtworkLightbox from '@/components/gallery/display/ArtworkLightbox';
import GalleryHeader from '@/components/gallery/display/GalleryHeader';
import GalleryFilters from '@/components/gallery/display/GalleryFilters';
import GalleryGrid from '@/components/gallery/display/GalleryGrid';

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

  return (
    <div id="gallery" className="w-full">
      <div className="px-4 md:px-16 lg:px-24">
        <GalleryHeader />
        <GalleryFilters
          categories={dbCategories}
          types={dbTypes}
          selectedCategory={selectedCategory}
          selectedType={selectedType}
          searchQuery={searchQuery}
          filteredCount={filteredArt.length}
          isAdmin={isAdmin}
          storageRefresh={storageRefresh}
          onCategoryChange={setSelectedCategory}
          onTypeChange={setSelectedType}
          onSearchChange={setSearchQuery}
          onOpenManager={() => setManagerConfig({ open: true, type: 'category' })}
        />
      </div>

      <GalleryGrid
        artworks={filteredArt}
        searchQuery={searchQuery}
        isAdmin={isAdmin}
        onUploadClick={() => { setEditingArtwork(null); setIsModalOpen(true); }}
        onEdit={(art) => { setEditingArtwork(art); setIsModalOpen(true); }}
        onClick={(art, index) => { setSelectedArtwork(art); setSelectedIndex(index); }}
        onDelete={() => { fetchArtworks(); setStorageRefresh(n => n + 1); }}
      />

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