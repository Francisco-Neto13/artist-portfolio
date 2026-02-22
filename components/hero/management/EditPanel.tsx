'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ProfileData, BIO_MAX } from '../types';
import EditAvatarSection from './EditAvatarSection';
import EditProfileFields from './EditProfileFields';
import EditSocialLinks from './EditSocialLinks';
import EditListSection from './EditListSection';
import AvatarCropModal from './AvatarCropModal';

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
  const [cropSrc, setCropSrc] = useState<string | null>(null);

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

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async (blob: Blob) => {
    setCropSrc(null);
    setAvatarUploading(true);
    try {
      if (draft.avatar_url && draft.avatar_url.includes('perfil')) {
        const oldFileName = draft.avatar_url.split('/').pop()?.split('?')[0];
        if (oldFileName) await supabase.storage.from('perfil').remove([oldFileName]);
      }
      const fileName = `avatar-${Date.now()}.webp`;
      const { error: upErr } = await supabase.storage
        .from('perfil')
        .upload(fileName, blob, { upsert: false, contentType: 'image/webp', cacheControl: '31536000' });
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

  if (!mounted) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onCancel} />
        <div className="relative w-full max-w-md bg-slate-900 border border-white/[0.06] rounded-2xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent rounded-t-2xl" />

          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-white/[0.05] shrink-0">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Edit Profile</p>
            <button onClick={onCancel} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all cursor-pointer">
              <X size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5" style={{ scrollbarWidth: 'thin' }}>
            <EditAvatarSection
              avatarUrl={draft.avatar_url}
              uploading={avatarUploading}
              onChange={handleAvatarUpload}
            />
            <EditProfileFields
              fullName={draft.full_name}
              bio={draft.bio}
              location={draft.location}
              onChangeName={(v) => onDraftChange({ ...draft, full_name: v })}
              onChangeBio={(v) => onDraftChange({ ...draft, bio: v })}
              onChangeLocation={(v) => onDraftChange({ ...draft, location: v })}
            />
            <EditSocialLinks
              links={draft.social_links}
              onChange={(links) => onDraftChange({ ...draft, social_links: links })}
            />
            {(['languages', 'hobbies'] as const).map((type) => (
              <EditListSection
                key={type}
                type={type}
                items={draft[type]}
                onAdd={() => addItem(type)}
                onRemove={(i) => removeItem(type, i)}
                onUpdate={(i, field, value) => updateItem(type, i, field, value)}
              />
            ))}
          </div>

          <div className="px-6 py-5 border-t border-white/[0.05] flex gap-2 shrink-0">
            <button type="button" onClick={onCancel} disabled={isSaving} className="flex-1 py-2.5 rounded-xl border border-white/8 text-slate-400 hover:text-white hover:border-white/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={onSave} disabled={isSaving || draft.bio.length > BIO_MAX} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {cropSrc && (
        <AvatarCropModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}
    </>,
    document.body
  );
}