'use client';
import Image from 'next/image';
import { Camera, Loader2 } from 'lucide-react';

interface Props {
  avatarUrl: string | undefined;
  uploading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function EditAvatarSection({ avatarUrl, uploading, onChange }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 pb-2">
      <label className={`relative group cursor-pointer ${uploading ? 'pointer-events-none' : ''}`}>
        {uploading && (
          <div className="absolute -inset-1 rounded-full border border-blue-500/30 border-t-blue-500 animate-spin z-10" />
        )}
        <div className={`w-20 h-20 rounded-full bg-slate-800 border border-white/[0.06] overflow-hidden relative flex items-center justify-center transition-all duration-300 ${uploading ? 'scale-90 brightness-50' : 'hover:border-blue-500/30'}`}>
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" fill priority sizes="80px" className={`object-cover transition-all duration-500 ${uploading ? 'blur-sm scale-110' : ''}`} />
          ) : (
            <Camera size={24} className="text-slate-600" />
          )}
          <div className={`absolute inset-0 flex items-center justify-center rounded-full transition-opacity duration-300 ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 bg-black/60'}`}>
            {uploading ? <Loader2 size={20} className="text-white animate-spin" /> : <Camera size={18} className="text-white" />}
          </div>
        </div>
        <input type="file" className="hidden" accept="image/*" onChange={onChange} disabled={uploading} />
      </label>
      <p className="text-[9px] uppercase tracking-[0.2em] text-slate-600 font-bold">
        {uploading ? 'Processing...' : 'Click to change avatar'}
      </p>
    </div>
  );
}