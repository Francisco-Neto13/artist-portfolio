'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Instagram, Twitter, Mail, Plus, Trash2, Check, X, Camera, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ProfileData, BIO_MAX } from './types';
import { convertToWebP } from '@/lib/imageUtils';

interface EditPanelProps {
  draft: ProfileData;
  isSaving: boolean;
  onDraftChange: (draft: ProfileData) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function EditPanel({ draft, isSaving, onDraftChange, onSave, onCancel }: EditPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const addItem = (type: 'languages' | 'hobbies') => {
    onDraftChange({ ...draft, [type]: [...(draft[type] || []), { label: 'New item', status: 'Click to edit' }] });
  };

  const removeItem = (type: 'languages' | 'hobbies', index: number) => {
    const arr = [...draft[type]];
    arr.splice(index, 1);
    onDraftChange({ ...draft, [type]: arr });
  };

  const updateItem = (type: 'languages' | 'hobbies', index: number, field: string, value: string) => {
    const arr = [...draft[type]];
    arr[index] = { ...arr[index], [field]: value };
    onDraftChange({ ...draft, [type]: arr });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    try {
      const { blob } = await convertToWebP(file);

      if (draft.avatar_url && draft.avatar_url.includes('perfil')) {
        const oldFileName = draft.avatar_url.split('/').pop()?.split('?')[0];
        if (oldFileName) {
          await supabase.storage.from('perfil').remove([oldFileName]);
        }
      }

      const fileName = `avatar-${Date.now()}.webp`;

      const { error: upErr } = await supabase.storage
        .from('perfil')
        .upload(fileName, blob, { 
          upsert: false, 
          contentType: 'image/webp',
          cacheControl: '31536000' 
        });

      if (upErr) throw upErr;

      const { data } = supabase.storage.from('perfil').getPublicUrl(fileName);
      onDraftChange({ ...draft, avatar_url: data.publicUrl });

    } catch (err: any) {
      console.error('Avatar upload failed:', err.message);
      alert('Upload failed: ' + err.message);
    } finally {
      setAvatarUploading(false);
    }
  };

  const inputClass = "w-full bg-slate-950/80 border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 transition-all";
  const smallInputClass = "w-full bg-slate-950/80 border border-white/[0.06] rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-blue-500/50 transition-all";

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative w-full max-md bg-slate-900 border border-white/[0.06] rounded-2xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent rounded-t-2xl" />

        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-white/[0.05] shrink-0">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Edit Profile</p>
          <button onClick={onCancel} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all cursor-pointer">
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5" style={{ scrollbarWidth: 'thin' }}>
          
          <div className="flex flex-col items-center gap-3 pb-2">
            <label className={`relative group cursor-pointer ${avatarUploading ? 'pointer-events-none' : ''}`}>
              {avatarUploading && (
                <div className="absolute -inset-1 rounded-full border border-blue-500/30 border-t-blue-500 animate-spin z-10" />
              )}
              
              <div className={`w-20 h-20 rounded-full bg-slate-800 border border-white/[0.06] overflow-hidden relative flex items-center justify-center transition-all duration-300 ${avatarUploading ? 'scale-90 brightness-50' : 'hover:border-blue-500/30'}`}>
                {draft.avatar_url ? (
                  <Image 
                    src={draft.avatar_url} 
                    alt="Avatar" 
                    fill 
                    className={`object-cover transition-all duration-500 ${avatarUploading ? 'blur-sm scale-110' : ''}`} 
                    unoptimized 
                  />
                ) : (
                  <Camera size={24} className="text-slate-600" />
                )}

                <div className={`absolute inset-0 flex items-center justify-center rounded-full transition-opacity duration-300 ${avatarUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 bg-black/60'}`}>
                  {avatarUploading 
                    ? <Loader2 size={20} className="text-white animate-spin" />
                    : <Camera size={18} className="text-white" />
                  }
                </div>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={avatarUploading} />
            </label>
            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-600 font-bold">
              {avatarUploading ? "Processing..." : "Click to change avatar"}
            </p>
          </div>

          <div>
            <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 block mb-2">Name</label>
            <input 
              className={inputClass} 
              value={draft.full_name} 
              onChange={(e) => onDraftChange({ ...draft, full_name: e.target.value })} 
            />
          </div>

          <div>
            <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 block mb-2">Bio</label>
            <div className="flex justify-end mb-1">
              <span className={`text-[9px] font-mono tabular-nums ${draft.bio.length > BIO_MAX ? 'text-red-400' : 'text-slate-600'}`}>
                {draft.bio.length}/{BIO_MAX}
              </span>
            </div>
            <textarea
              className={`${inputClass} resize-none`}
              rows={3}
              value={draft.bio}
              maxLength={BIO_MAX}
              onChange={(e) => onDraftChange({ ...draft, bio: e.target.value })}
            />
          </div>

          <div>
            <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 block mb-2">Location</label>
            <input 
              className={inputClass} 
              value={draft.location} 
              onChange={(e) => onDraftChange({ ...draft, location: e.target.value })} 
            />
          </div>

          <div>
            <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 block mb-2">Social Links</label>
            <div className="space-y-2">
              {(['instagram', 'twitter', 'mail'] as const).map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    {s === 'instagram' && <Instagram size={13} />}
                    {s === 'twitter' && <Twitter size={13} />}
                    {s === 'mail' && <Mail size={13} />}
                  </div>
                  <input
                    className="flex-1 bg-slate-950/80 border border-white/[0.06] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-blue-500/50 transition-all"
                    value={draft.social_links[s]}
                    placeholder={`${s} URL`}
                    onChange={(e) => onDraftChange({ ...draft, social_links: { ...draft.social_links, [s]: e.target.value } })}
                  />
                </div>
              ))}
            </div>
          </div>

          {(['languages', 'hobbies'] as const).map((type) => (
            <div key={type}>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">{type}</label>
                <button 
                  type="button"
                  onClick={() => addItem(type)} 
                  className="w-6 h-6 rounded-lg bg-blue-600/20 hover:bg-blue-600 flex items-center justify-center text-blue-400 hover:text-white transition-all cursor-pointer"
                >
                  <Plus size={12} />
                </button>
              </div>
              <div className="space-y-2">
                {draft[type].map((item, idx) => (
                  <div key={`${type}-${idx}`} className="flex gap-2 items-center">
                    <div className="flex-1 space-y-1.5">
                      <input 
                        className={smallInputClass} 
                        value={item.label} 
                        placeholder={type === 'languages' ? 'Language' : 'Hobby'} 
                        onChange={(e) => updateItem(type, idx, 'label', e.target.value)} 
                      />
                      <input 
                        className={`${smallInputClass} text-slate-400`} 
                        value={item.status} 
                        placeholder={type === 'languages' ? 'Level' : 'Description'} 
                        onChange={(e) => updateItem(type, idx, 'status', e.target.value)} 
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeItem(type, idx)} 
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-700 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-5 border-t border-white/[0.05] flex gap-2 shrink-0">
          <button 
            type="button"
            onClick={onCancel} 
            disabled={isSaving} 
            className="flex-1 py-2.5 rounded-xl border border-white/8 text-slate-400 hover:text-white hover:border-white/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || draft.bio.length > BIO_MAX}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : <Check size={13} />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}