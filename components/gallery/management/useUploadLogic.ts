import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Artwork, convertToWebP, ArtworkCategory, ArtworkType } from '../types';

export function useUploadLogic(onSuccess: () => void, onClose: () => void, editingArtwork?: Artwork | null) {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [availableCategories, setAvailableCategories] = useState<ArtworkCategory[]>([]);
  const [availableTypes, setAvailableTypes] = useState<ArtworkType[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    category: '', 
    type: ''
  });

  const fetchMetadata = useCallback(async () => {
    const [catRes, typeRes] = await Promise.all([
      supabase.from('artwork_categories').select('*').order('name'),
      supabase.from('artwork_types').select('*').order('name')
    ]);
    if (catRes.data) setAvailableCategories(catRes.data);
    if (typeRes.data) setAvailableTypes(typeRes.data);
  }, []);

  useEffect(() => { fetchMetadata(); }, [fetchMetadata]);

  const resetForm = useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setFormData({ 
      title: '', 
      category: '', 
      type: '' 
    });
  }, []);

  const addItem = async (table: 'artwork_categories' | 'artwork_types', name: string) => {
    const { error } = await supabase.from(table).insert([{ name }]);
    if (!error) fetchMetadata();
  };

  const removeItem = async (table: 'artwork_categories' | 'artwork_types', id: string, name: string) => {
    const column = table === 'artwork_categories' ? 'category' : 'type';
    
    const { count } = await supabase
      .from('artworks')
      .select('*', { count: 'exact', head: true })
      .eq(column, name);

    if (count && count > 0) {
      alert(`Safety Lock: Cannot delete "${name}". It is being used by ${count} artworks.`);
      return;
    }

    if (confirm(`Delete "${name}"?`)) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (!error) fetchMetadata();
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !editingArtwork) return alert('Select an image!');
    
    if (!formData.category || !formData.type) {
        return alert('Please select both a Category and a Theme!');
    }

    setLoading(true);
    try {
      let publicUrl = editingArtwork?.image_url || '';
      if (file) {
        setUploadProgress(30);
        const webpBlob = await convertToWebP(file);
        const fileName = `${Math.random()}-${Date.now()}.webp`;
        const { error: upErr } = await supabase.storage.from('gallery').upload(`artworks/${fileName}`, webpBlob);
        if (upErr) throw upErr;
        const { data } = supabase.storage.from('gallery').getPublicUrl(`artworks/${fileName}`);
        publicUrl = data.publicUrl;
      }
      setUploadProgress(80);
      const payload = { ...formData, image_url: publicUrl };
      const { error } = editingArtwork 
        ? await supabase.from('artworks').update(payload).eq('id', editingArtwork.id)
        : await supabase.from('artworks').insert([payload]);
      
      if (!error) { 
        setUploadProgress(100);
        onSuccess(); 
        onClose(); 
      }
    } catch (err) { 
      alert('Upload failed'); 
    } finally { 
      setLoading(false); 
    }
  };

  return {
    file, setFile, previewUrl, setPreviewUrl, formData, setFormData,
    loading, uploadProgress, handleUpload, resetForm,
    availableCategories, availableTypes, addItem, removeItem
  };
}