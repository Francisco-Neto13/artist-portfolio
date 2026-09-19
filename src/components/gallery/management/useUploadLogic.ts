import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Artwork, ArtworkCategory, ArtworkType } from '../types';
import { convertToWebP } from '@/lib/imageUtils';
import { storagePathFromPublicUrl } from '@/lib/storagePaths';
import { mensagemDeErro, useToast } from '@/components/providers/ToastProvider';

export function useUploadLogic(
  onSuccess: () => void,
  onClose: () => void,
  editingArtwork?: Artwork | null
) {
  const { pushToast } = useToast();
  const previewBlobUrlRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrlState] = useState<string | null>(null);
  const [isOptimized, setIsOptimized] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<ArtworkCategory[]>([]);
  const [availableTypes, setAvailableTypes] = useState<ArtworkType[]>([]);
  const [formData, setFormData] = useState({ title: '', category: '', type: '' });

  const setPreviewUrl = useCallback((nextUrl: string | null) => {
    if (previewBlobUrlRef.current && previewBlobUrlRef.current !== nextUrl) {
      URL.revokeObjectURL(previewBlobUrlRef.current);
      previewBlobUrlRef.current = null;
    }

    if (nextUrl && nextUrl.startsWith('blob:')) {
      previewBlobUrlRef.current = nextUrl;
    }

    setPreviewUrlState(nextUrl);
  }, []);

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
    if (previewBlobUrlRef.current) {
      URL.revokeObjectURL(previewBlobUrlRef.current);
      previewBlobUrlRef.current = null;
    }

    setFile(null);
    setPreviewUrlState(null);
    setIsOptimized(false);
    setUploadProgress(0);
    setFormData({ title: '', category: '', type: '' });
  }, []);

  const handleFileChange = useCallback((selectedFile: File) => {
    if (previewBlobUrlRef.current) {
      URL.revokeObjectURL(previewBlobUrlRef.current);
      previewBlobUrlRef.current = null;
    }

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    previewBlobUrlRef.current = url;
    setPreviewUrlState(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      setIsOptimized(img.width > 2048 || img.height > 2048);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewBlobUrlRef.current) {
        URL.revokeObjectURL(previewBlobUrlRef.current);
        previewBlobUrlRef.current = null;
      }
    };
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.type) return;

    setLoading(true);
    setUploadProgress(5);

    try {
      let publicUrl = editingArtwork?.image_url || '';
      // Mantem as medidas da obra ao editar so os metadados, sem trocar o arquivo.
      let width = editingArtwork?.width ?? null;
      let height = editingArtwork?.height ?? null;

      if (file) {
        setUploadProgress(10);

        const conversao = await convertToWebP(file);
        const blob = conversao.blob;
        width = conversao.width;
        height = conversao.height;

        setUploadProgress(40);
        const fileName = `${crypto.randomUUID()}.webp`;

        const { error: upErr } = await supabase.storage
          .from('gallery')
          .upload(`artworks/${fileName}`, blob, {
            cacheControl: '31536000',
            upsert: false
          });

        if (upErr) throw upErr;

        if (editingArtwork?.image_url) {
          const oldPath = storagePathFromPublicUrl(editingArtwork.image_url, 'gallery');
          if (oldPath) await supabase.storage.from('gallery').remove([oldPath]);
        }

        const { data } = supabase.storage
          .from('gallery')
          .getPublicUrl(`artworks/${fileName}`);
        publicUrl = data.publicUrl;
      }

      setUploadProgress(85);
      const payload = { ...formData, image_url: publicUrl, width, height };

      const { error } = editingArtwork
        ? await supabase.from('artworks').update(payload).eq('id', editingArtwork.id)
        : await supabase.from('artworks').insert([payload]);

      if (error) throw error;

      setUploadProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300));

      onSuccess();
      onClose();
      pushToast(editingArtwork ? 'Artwork updated.' : 'Artwork published.', 'success');
    } catch (err) {
      console.error('Upload failed:', err);
      pushToast(mensagemDeErro(err, 'Upload failed. Please try again.'), 'error');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return {
    file, handleFileChange, previewUrl, setPreviewUrl, isOptimized,
    formData, setFormData, loading, uploadProgress, handleUpload,
    resetForm, availableCategories, availableTypes,
  };
}
