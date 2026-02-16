import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { convertToWebP } from '../types';

export function useUploadLogic(onSuccess: () => void, onClose: () => void) {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Digital',
    type: ''
  });

  const resetForm = () => {
    setFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setFormData({ title: '', description: '', category: 'Digital', type: '' });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Selecione uma imagem!');
    setLoading(true);
    setUploadProgress(0);

    try {
      setUploadProgress(20);
      const webpBlob = await convertToWebP(file);
      setUploadProgress(40);

      const fileName = `${Math.random()}-${Date.now()}.webp`;
      const filePath = `artworks/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, webpBlob, { contentType: 'image/webp', cacheControl: '3600' });

      if (uploadError) throw uploadError;
      setUploadProgress(70);

      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(filePath);
      setUploadProgress(85);

      const { error: dbError } = await supabase.from('artworks').insert([{
        ...formData,
        image_url: publicUrl
      }]);

      if (dbError) throw dbError;
      setUploadProgress(100);

      setTimeout(() => {
        onSuccess();
        onClose();
        resetForm();
      }, 500);
    } catch (error: any) {
      alert('Erro no upload: ' + error.message);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return {
    file, setFile, previewUrl, setPreviewUrl, formData, setFormData,
    loading, uploadProgress, handleUpload, resetForm
  };
}