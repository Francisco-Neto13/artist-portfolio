import { BIO_MAX } from '../types';

interface Props {
  fullName: string;
  bio: string;
  location: string;
  onChangeName: (v: string) => void;
  onChangeBio: (v: string) => void;
  onChangeLocation: (v: string) => void;
}

const inputClass = "w-full bg-slate-950/80 border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 transition-all";

export default function EditProfileFields({ fullName, bio, location, onChangeName, onChangeBio, onChangeLocation }: Props) {
  return (
    <>
      <div>
        <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 block mb-2">Name</label>
        <input className={inputClass} value={fullName} onChange={(e) => onChangeName(e.target.value)} />
      </div>

      <div>
        <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 block mb-2">Bio</label>
        <div className="flex justify-end mb-1">
          <span className={`text-[9px] font-mono tabular-nums ${bio.length > BIO_MAX ? 'text-red-400' : 'text-slate-600'}`}>
            {bio.length}/{BIO_MAX}
          </span>
        </div>
        <textarea
          className={`${inputClass} resize-none`}
          rows={3}
          value={bio}
          maxLength={BIO_MAX}
          onChange={(e) => onChangeBio(e.target.value)}
        />
      </div>

      <div>
        <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 block mb-2">Location</label>
        <input className={inputClass} value={location} onChange={(e) => onChangeLocation(e.target.value)} />
      </div>
    </>
  );
}