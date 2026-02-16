import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Artwork, convertToWebP } from '../types';

export function useUploadLogic(onSuccess: () => void, onClose: () => void, editingArtwork?: Artwork | null) {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Digital',
    type: ''
  });

  useEffect(() => {
    const fetchTypes = async () => {
      const { data } = await supabase.from('artwork_types').select('name').order('name');
      if (data) setAvailableTypes(data.map(t => t.name));
    };
    fetchTypes();
  }, []);

  const resetForm = useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setFormData({ title: '', category: 'Digital', type: '' });
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !editingArtwork) return alert('Selecione uma imagem!');
    if (!formData.type) return alert('Selecione um tema!');

    setLoading(true);
    try {
      let publicUrl = editingArtwork?.image_url || '';

      if (file) {
        setUploadProgress(20);
        const webpBlob = await convertToWebP(file);
        setUploadProgress(40);
        const fileName = `${Math.random()}-${Date.now()}.webp`;
        const { error: uploadError } = await supabase.storage
          .from('gallery').upload(`artworks/${fileName}`, webpBlob);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('gallery').getPublicUrl(`artworks/${fileName}`);
        publicUrl = data.publicUrl;
      }

      setUploadProgress(80);
      const payload = {
        title: formData.title,
        category: formData.category,
        type: formData.type,
        image_url: publicUrl
      };

      const { error: dbError } = editingArtwork 
        ? await supabase.from('artworks').update(payload).eq('id', editingArtwork.id)
        : await supabase.from('artworks').insert([payload]);

      if (dbError) throw dbError;
      
      setUploadProgress(100);
      setTimeout(() => { onSuccess(); onClose(); resetForm(); }, 500);
    } catch (error: any) {
      alert('Erro: ' + error.message);
    } finally { setLoading(false); }
  };

  return {
    file, setFile, previewUrl, setPreviewUrl, formData, setFormData,
    loading, uploadProgress, handleUpload, resetForm, availableTypes
  };
}