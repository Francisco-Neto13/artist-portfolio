import { ConversionResult } from '@/components/gallery/types';

const MAX_FILE_SIZE_MB = 25;
const QUALITY = 0.82;

const WORKER_CODE = /* javascript */ `
self.onmessage = async (event) => {
  const { id, file, quality, maxDim } = event.data;
  let bitmap = null;
  try {
    bitmap = await createImageBitmap(file);
    let width = bitmap.width;
    let height = bitmap.height;
    if (width > maxDim || height > maxDim) {
      const ratio = Math.min(maxDim / width, maxDim / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) throw new Error('Could not get canvas context.');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high'; 
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await canvas.convertToBlob({ type: 'image/webp', quality: quality });
    self.postMessage({ id, status: 'success', blob, width, height });
  } catch (err) {
    self.postMessage({ id, status: 'error', message: err?.message ?? 'Unknown error.' });
  } finally {
    bitmap?.close();
  }
};
`;

let worker: Worker | null = null;
let workerBlobUrl: string | null = null;

const pendingJobs = new Map<string, { resolve: (r: ConversionResult) => void; reject: (e: Error) => void }>();

function getWorker(): Worker {
  if (worker) return worker;
  if (!workerBlobUrl) {
    const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
    workerBlobUrl = URL.createObjectURL(blob);
  }
  worker = new Worker(workerBlobUrl);
  worker.onmessage = (event) => {
    const data = event.data;
    const job = pendingJobs.get(data.id);
    if (!job) return;
    pendingJobs.delete(data.id);
    if (data.status === 'success') {
      job.resolve({ blob: data.blob, width: data.width, height: data.height });
    } else {
      job.reject(new Error(data.message));
    }
  };
  return worker;
}

export async function convertToWebP(file: File, maxDim: number = 2048): Promise<ConversionResult> {
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
  }
  if (typeof Worker === 'undefined') {
    return convertOnMainThread(file, maxDim);
  }
  const id = crypto.randomUUID();
  return new Promise<ConversionResult>((resolve, reject) => {
    pendingJobs.set(id, { resolve, reject });
    getWorker().postMessage({ id, file, quality: QUALITY, maxDim });
  });
}

async function convertOnMainThread(file: File, maxDim: number): Promise<ConversionResult> {
  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
    let width = bitmap.width;
    let height = bitmap.height;
    if (width > maxDim || height > maxDim) {
      const ratio = Math.min(maxDim / width, maxDim / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    const useOffscreen = typeof OffscreenCanvas !== 'undefined';
    const canvas = useOffscreen
      ? new OffscreenCanvas(width, height)
      : Object.assign(document.createElement('canvas'), { width, height });
    const ctx = canvas.getContext('2d');
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
    return { blob, width, height };
  } finally {
    bitmap?.close?.();
  }
}

const CAMINHO_OBJETO = '/storage/v1/object/public/';
const CAMINHO_RENDER = '/storage/v1/render/image/public/';

/**
 * URL redimensionada pelo Supabase.
 *
 * ⚠️ A versao anterior so colava `?width=&quality=&format=` na url de
 * `/object/public/` — e esse endpoint IGNORA os parametros. Conferido na
 * origem: com `?width=200&quality=20` ele devolvia os mesmos 191688 bytes do
 * arquivo cru. O redimensionamento vive em `/render/image/public/`, que para
 * o mesmo pedido devolve 8561 bytes.
 *
 * Na pratica a galeria inteira servia os originais: 20,5 MB na home, media de
 * 840 KB por arte, a maior com 4,3 MB. O pipeline de WebP do upload funciona —
 * o que nunca funcionou foi a otimizacao na LEITURA.
 *
 * `format` saiu da lista: nao e parametro valido do Supabase (o unico aceito e
 * `format=origin`, para DESLIGAR a conversao). Por padrao o endpoint ja
 * negocia webp pelo header Accept do navegador.
 */
export const getOptimizedUrl = (url: string, quality = 82, width = 800) => {
  if (!url) return url;

  try {
    const otimizada = new URL(url);

    // Aceita as duas formas: a url crua e uma ja otimizada, porque trocar o
    // tamanho de uma url existente (card -> lightbox) e caso corrente.
    if (otimizada.pathname.startsWith(CAMINHO_OBJETO)) {
      otimizada.pathname = CAMINHO_RENDER + otimizada.pathname.slice(CAMINHO_OBJETO.length);
    } else if (!otimizada.pathname.startsWith(CAMINHO_RENDER)) {
      return url;
    }
    otimizada.searchParams.set('width', String(width));
    otimizada.searchParams.set('quality', String(quality));
    // `contain` preserva o enquadramento: e obra de arte, cortar nao e opcao.
    otimizada.searchParams.set('resize', 'contain');
    return otimizada.toString();
  } catch {
    return url;
  }
};

/**
 * Desfaz o acima: volta para o arquivo cru em `/object/public/`.
 *
 * E o alvo do `onError` dos <img>. Se a transformacao falhar por qualquer
 * motivo — cota, formato que o resizer nao aceita, indisponibilidade — a arte
 * ainda aparece, pesada porem visivel.
 */
export const getOriginalImageUrl = (url: string) => {
  if (!url) return url;

  try {
    const original = new URL(url);
    if (original.pathname.startsWith(CAMINHO_RENDER)) {
      original.pathname = CAMINHO_OBJETO + original.pathname.slice(CAMINHO_RENDER.length);
    }
    for (const p of ['width', 'height', 'quality', 'resize', 'format']) {
      original.searchParams.delete(p);
    }
    return original.toString();
  } catch {
    return url;
  }
};

export const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
