'use client';
import { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, Loader2 } from 'lucide-react';

interface AvatarCropModalProps {
  imageSrc: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

function centerAspectCrop(width: number, height: number) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 80 }, 1, width, height),
    width, height
  );
}

export default function AvatarCropModal({ imageSrc, onConfirm, onCancel }: AvatarCropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [processing, setProcessing] = useState(false);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height));
  };

  const handleConfirm = async () => {
    if (!completedCrop || !imgRef.current) return;
    setProcessing(true);

    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    const outputSize = 500;
    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      cropWidth,
      cropHeight,
      0, 0,
      outputSize,
      outputSize
    );

    canvas.toBlob((blob) => {
      if (blob) onConfirm(blob);
      setProcessing(false);
    }, 'image/webp', 0.95);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/[0.06] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent rounded-t-2xl" />

        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.05]">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Crop Avatar</p>
          <button onClick={onCancel} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all cursor-pointer">
            <X size={14} />
          </button>
        </div>

        <div className="p-5 flex items-center justify-center bg-slate-950/50">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            circularCrop
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="max-h-[500px] max-w-full object-contain"
            />
          </ReactCrop>
        </div>

        <p className="text-center text-[9px] text-slate-600 font-bold uppercase tracking-widest pb-3">
          Drag to adjust • Scroll to zoom
        </p>

        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/8 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={processing || !completedCrop}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {processing ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            {processing ? 'Processing...' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}