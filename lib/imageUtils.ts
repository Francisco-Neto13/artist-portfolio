import { ConversionResult } from '@/components/gallery/types';

const MAX_FILE_SIZE_MB = 25;
const MAX_DIMENSION = 2048;
const QUALITY = 0.82;

const WORKER_CODE = /* javascript */ `
const MAX_DIMENSION = ${MAX_DIMENSION};

self.onmessage = async (event) => {
  const { id, file, quality } = event.data;
  let bitmap = null;

  try {
    bitmap = await createImageBitmap(file);

    let width = bitmap.width;
    let height = bitmap.height;
    const wasResized = width > MAX_DIMENSION || height > MAX_DIMENSION;

    if (wasResized) {
      const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d', { 
      alpha: true, // Garante suporte a transparência se necessário
      desynchronized: true // Melhora performance no Worker
    });

    if (!ctx) throw new Error('Could not get canvas context.');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium'; 
    
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);

    const finalQuality = quality; 

    const blob = await canvas.convertToBlob({ 
      type: 'image/webp', 
      quality: finalQuality 
    });

    self.postMessage({ id, status: 'success', blob, wasResized });
  } catch (err) {
    self.postMessage({ id, status: 'error', message: err?.message ?? 'Unknown error.' });
  } finally {
    bitmap?.close();
  }
};
`;

let worker: Worker | null = null;
let workerBlobUrl: string | null = null;

const pendingJobs = new Map<
  string,
  { resolve: (r: ConversionResult) => void; reject: (e: Error) => void }
>();

function getWorker(): Worker {
  if (worker) return worker;

  if (!workerBlobUrl) {
    const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
    workerBlobUrl = URL.createObjectURL(blob);
  }

  worker = new Worker(workerBlobUrl);

  worker.onmessage = (event) => {
    const data = event.data as
      | { id: string; status: 'success'; blob: Blob; wasResized: boolean }
      | { id: string; status: 'error'; message: string };

    const job = pendingJobs.get(data.id);
    if (!job) return;
    pendingJobs.delete(data.id);

    if (data.status === 'success') {
      job.resolve({ blob: data.blob, wasResized: data.wasResized });
    } else {
      job.reject(new Error(data.message));
    }
  };

  worker.onerror = (event) => {
    for (const [id, job] of pendingJobs) {
      job.reject(new Error(`Worker error: ${event.message}`));
      pendingJobs.delete(id);
    }
    worker = null; 
  };

  return worker;
}

export async function convertToWebP(file: File): Promise<ConversionResult> {
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
  }

  if (typeof Worker === 'undefined') {
    return convertOnMainThread(file);
  }

  const id = crypto.randomUUID();
  return new Promise<ConversionResult>((resolve, reject) => {
    pendingJobs.set(id, { resolve, reject });
    getWorker().postMessage({ id, file, quality: QUALITY });
  });
}

async function convertOnMainThread(file: File): Promise<ConversionResult> {
  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);

    let width = bitmap.width;
    let height = bitmap.height;
    const wasResized = width > MAX_DIMENSION || height > MAX_DIMENSION;

    if (wasResized) {
      const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const useOffscreen = typeof OffscreenCanvas !== 'undefined';
    const canvas = useOffscreen
      ? new OffscreenCanvas(width, height)
      : Object.assign(document.createElement('canvas'), { width, height });

    const ctx = canvas.getContext('2d') as
      | OffscreenCanvasRenderingContext2D
      | CanvasRenderingContext2D
      | null;

    if (!ctx) throw new Error('Could not get canvas context.');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = useOffscreen
      ? await (canvas as OffscreenCanvas).convertToBlob({ type: 'image/webp', quality: QUALITY })
      : await new Promise<Blob>((resolve, reject) =>
          (canvas as HTMLCanvasElement).toBlob(
            (b) => (b ? resolve(b) : reject(new Error('WebP conversion failed.'))),
            'image/webp',
            QUALITY
          )
        );

    return { blob, wasResized };
  } finally {
    bitmap?.close?.();
  }
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