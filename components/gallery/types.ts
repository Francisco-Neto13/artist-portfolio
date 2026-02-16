export interface Artwork {
  id: string;
  title: string;
  image_url: string;
  category: string;
  type: string; 
  created_at: string; 
}

export const CATEGORIES = ['Digital', 'Traditional', 'Photography', 'Sculpture'] as const;

export const getOptimizedUrl = (url: string, quality = 80, width = 800) => {
  if (!url || !url.includes('supabase.co')) return url;
  return `${url}?width=${width}&quality=${quality}&format=webp`;
};

export async function convertToWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível obter o contexto do canvas'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Erro na conversão WebP'));
        }, 'image/webp', 0.95);
      };
      img.onerror = () => reject(new Error('Erro ao carregar imagem para conversão'));
    };
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo original'));
  });
}

export const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};