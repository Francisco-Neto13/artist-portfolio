export interface Artwork {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  created_at: string;
  image_url: string;
}

export const CATEGORIES = ['Digital', 'Painting', 'Sketches'];

export const getOptimizedUrl = (url: string, quality = 75, width = 800) => {
  if (!url) return '';
  return `${url}?width=${width}&quality=${quality}&format=webp`;
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).replace('.', '');
};

export const convertToWebP = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (!ctx) return reject(new Error('Canvas context failed'));
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('WebP conversion failed'));
      }, 'image/webp', 0.95);
    };
    img.src = URL.createObjectURL(file);
  });
};