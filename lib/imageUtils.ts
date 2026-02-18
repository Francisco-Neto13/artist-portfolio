import { ConversionResult } from '@/components/gallery/types';

const MAX_DIMENSION = 2048;
const MAX_FILE_SIZE_MB = 25;

export async function convertToWebP(file: File): Promise<ConversionResult> {
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let { width, height } = img;
        const wasResized = width > MAX_DIMENSION || height > MAX_DIMENSION;

        if (wasResized) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, wasResized });
            } else {
              reject(new Error('WebP conversion failed.'));
            }
          },
          'image/webp',
          0.82
        );
      };

      img.onerror = () => reject(new Error('Failed to load image for conversion.'));
    };

    reader.onerror = () => reject(new Error('Failed to read the original file.'));
  });
}

export const getOptimizedUrl = (url: string, quality = 85, width = 800) => {
  if (!url || !url.includes('supabase.co')) return url;
  return `${url}?width=${width}&quality=${quality}&format=webp`;
};

export const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};