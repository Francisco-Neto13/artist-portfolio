import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Artwork, ArtworkCategory, ArtworkType } from '../types';
import { convertToWebP } from '@/lib/imageUtils'; 

const extractStoragePath = (url: string): string | null => {
  const marker = '/gallery/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.substring(idx + marker.length);
};

export function useUploadLogic(
  onSuccess: () => void,
  onClose: () => void,
  editingArtwork?: Artwork | null
) {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isOptimized, setIsOptimized] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<ArtworkCategory[]>([]);
  const [availableTypes, setAvailableTypes] = useState<ArtworkType[]>([]);
  const [formData, setFormData] = useState({ title: '', category: '', type: '' });

  const fetchMetadata = useCallback(async () => {
    const [catRes, typeRes] = await Promise.all([
      supabase.from('artwork_categories').select('*').order('name'),
      supabase.from('artwork_types').select('*').order('name'),
    ]);
    if (catRes.data) setAvailableCategories(catRes.data);
    if (typeRes.data) setAvailableTypes(typeRes.data);
  }, []);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  const resetForm = useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    setIsOptimized(false);
    setUploadProgress(0);
    setFormData({ title: '', category: '', type: '' });
  }, []);

  const handleFileChange = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      setIsOptimized(img.width > 2048 || img.height > 2048);
    };
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.type) return;

    setLoading(true);
    setUploadProgress(5);

    try {
      let publicUrl = editingArtwork?.image_url || '';

      if (file) {
        setUploadProgress(10);
        
        const { blob } = await convertToWebP(file);

        setUploadProgress(40);
        const fileName = `${Math.random()}-${Date.now()}.webp`;

        const { error: upErr } = await supabase.storage
          .from('gallery')
          .upload(`artworks/${fileName}`, blob, {
            cacheControl: '31536000',
            upsert: false
          });

        if (upErr) throw upErr;

        if (editingArtwork?.image_url) {
          const oldPath = extractStoragePath(editingArtwork.image_url);
          if (oldPath) await supabase.storage.from('gallery').remove([oldPath]);
        }

        const { data } = supabase.storage
          .from('gallery')
          .getPublicUrl(`artworks/${fileName}`);
        publicUrl = data.publicUrl;
      }

      setUploadProgress(85);
      const payload = { ...formData, image_url: publicUrl };

      const { error } = editingArtwork
        ? await supabase.from('artworks').update(payload).eq('id', editingArtwork.id)
        : await supabase.from('artworks').insert([payload]);

      if (error) throw error;

      setUploadProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300));

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

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
    if (count && count > 0) throw new Error(`in_use:${count}`);
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    fetchMetadata();
  };

  return {
    file, handleFileChange, previewUrl, setPreviewUrl, isOptimized,
    formData, setFormData, loading, uploadProgress, handleUpload,
    resetForm, availableCategories, availableTypes, addItem, removeItem,
  };
}