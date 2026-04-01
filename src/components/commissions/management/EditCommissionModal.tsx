'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, Check, Camera, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Commission, DESCRIPTION_MAX, COMM_TITLE_MAX, COMM_PRICE_MAX } from '../types';
import { convertToWebP, getOptimizedUrl, getOriginalImageUrl } from '@/lib/imageUtils'; 

interface EditCommissionModalProps {
  commission: Commission | null;
  onSave: (id: string, updates: Partial<Commission>) => void;
  onClose: () => void;
}

export default function EditCommissionModal({ commission, onSave, onClose }: EditCommissionModalProps) {
  const [draft, setDraft] = useState<Partial<Commission>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (commission) {
      setDraft({
        title: commission.title,
        price: commission.price,
        description: commission.description,
        image_url: commission.image_url
      });
    }
  }, [commission]);

  if (!commission) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      if (draft.image_url) {
        const marker = '/gallery/commissions/';
        const idx = draft.image_url.indexOf(marker);
        if (idx !== -1) {
          const oldPath = 'commissions/' + draft.image_url.substring(idx + marker.length);
          await supabase.storage.from('gallery').remove([oldPath]);
        }
      }

      const { blob } = await convertToWebP(file, 1000); 
      const fileName = `commission-${Date.now()}.webp`;

      const { error: upErr } = await supabase.storage
        .from('gallery')
        .upload(`commissions/${fileName}`, blob, {
          cacheControl: '31536000',
          upsert: false,
          contentType: 'image/webp'
        });

      if (upErr) throw upErr;

      const { data } = supabase.storage.from('gallery').getPublicUrl(`commissions/${fileName}`);
      setDraft(prev => ({ ...prev, image_url: data.publicUrl }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Upload failed:', message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    onSave(commission.id, draft);
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 300);
  };

  const isInvalid = 
    (draft.title?.length || 0) > COMM_TITLE_MAX || 
    (draft.price?.length || 0) > COMM_PRICE_MAX || 
    (draft.description?.length || 0) > DESCRIPTION_MAX ||
    !draft.title?.trim();

  const modal = (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-white/[0.06] rounded-2xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh]"
        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.8)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent rounded-t-2xl" />

        <div className="flex items-center justify-between px-4 md:px-6 pt-4 md:pt-6 pb-4 md:pb-5 border-b border-white/[0.05] shrink-0">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Edit Commission Tier</p>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all cursor-pointer">
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5 space-y-4 md:space-y-5" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(59,130,246,0.2) transparent' }}>
          <div>
            <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 block mb-2 md:mb-3 ml-1">Example Image</label>
            <div className="relative group">
              <label className="cursor-pointer block">
                <div className="aspect-[16/9] md:aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-950 border border-white/[0.06] relative flex items-center justify-center">
                  {draft.image_url ? (
                    <PreviewImage key={draft.image_url} imageUrl={draft.image_url} />
                  ) : (
                    <ImageIcon size={36} className="text-slate-800" />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-7 h-7 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span className="text-[8px] text-blue-400 font-bold uppercase tracking-widest">Optimizing</span>
                      </div>
                    </div>
                  )}
                  {!isUploading && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <Camera size={20} className="text-white" />
                    </div>
                  )}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:block md:space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-wider">Title</span>
                <span className={`text-[8px] font-bold ${(draft.title?.length || 0) >= COMM_TITLE_MAX ? 'text-red-500' : 'text-slate-600'}`}>
                  {draft.title?.length || 0}/{COMM_TITLE_MAX}
                </span>
              </div>
              <input 
                className="w-full bg-slate-950/80 border border-white/[0.06] rounded-xl px-3 md:px-4 py-2 text-white text-xs outline-none focus:border-blue-500/50 transition-all"
                value={draft.title || ''}
                maxLength={COMM_TITLE_MAX}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-wider">Price (USD)</span>
                <span className={`text-[8px] font-bold ${(draft.price?.length || 0) >= COMM_PRICE_MAX ? 'text-red-500' : 'text-slate-600'}`}>
                  {draft.price?.length || 0}/{COMM_PRICE_MAX}
                </span>
              </div>
              <input 
                className="w-full bg-slate-950/80 border border-white/[0.06] rounded-xl px-3 md:px-4 py-2 text-white text-xs outline-none focus:border-blue-500/50 transition-all"
                value={draft.price || ''}
                maxLength={COMM_PRICE_MAX}
                placeholder="150+"
                onChange={(e) => setDraft({ ...draft, price: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <span className="text-[8px] font-bold text-slate-600 uppercase tracking-wider">Description</span>
              <span className={`text-[8px] font-bold ${(draft.description?.length || 0) >= DESCRIPTION_MAX ? 'text-red-500' : 'text-slate-600'}`}>
                {draft.description?.length || 0}/{DESCRIPTION_MAX}
              </span>
            </div>
            <textarea 
              className="w-full bg-slate-950/80 border border-white/[0.06] rounded-xl px-3 md:px-4 py-2 text-white text-xs outline-none focus:border-blue-500/50 transition-all resize-none"
              rows={4}
              value={draft.description || ''}
              maxLength={DESCRIPTION_MAX}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="What's included in this tier..."
            />
          </div>
        </div>

        <div className="px-4 md:px-6 py-4 md:py-5 border-t border-white/[0.05] flex gap-2 shrink-0">
          <button 
            onClick={onClose} 
            disabled={isSaving}
            className="flex-1 py-2.5 rounded-xl border border-white/8 text-slate-400 hover:text-white hover:border-white/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || isInvalid}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : <Check size={13} />}
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

function PreviewImage({ imageUrl }: { imageUrl: string }) {
  const [imageSrc, setImageSrc] = useState(() => getOptimizedUrl(imageUrl, 82, 800));

  return (
    <Image 
      src={imageSrc}
      alt="Preview" 
      fill 
      onError={() => {
        const fallbackSrc = getOriginalImageUrl(imageUrl);
        if (imageSrc !== fallbackSrc) {
          setImageSrc(fallbackSrc);
        }
      }}
      className="object-cover" 
      sizes="(max-width: 768px) 100vw, 800px"
    />
  );
}
