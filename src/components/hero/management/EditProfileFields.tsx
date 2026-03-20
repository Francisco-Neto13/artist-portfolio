interface Props {
  fullName: string;
  bio: string;
  location: string;
  nameMax: number; 
  bioMax: number;
  locationMax: number;
  onChangeName: (v: string) => void;
  onChangeBio: (v: string) => void;
  onChangeLocation: (v: string) => void;
}

export default function EditProfileFields({ 
  fullName, bio, location, nameMax, bioMax, locationMax,
  onChangeName, onChangeBio, onChangeLocation 
}: Props) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">Full Name</label>
          <span className={`text-[8px] font-bold ${fullName.length >= nameMax ? 'text-red-500' : 'text-slate-600'}`}>
            {fullName.length}/{nameMax}
          </span>
        </div>
        <input
          maxLength={nameMax}
          className="w-full bg-slate-950/80 border border-white/[0.06] rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
          value={fullName}
          onChange={(e) => onChangeName(e.target.value)}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">Biography</label>
          <span className={`text-[8px] font-bold ${bio.length >= bioMax ? 'text-red-500' : 'text-slate-600'}`}>
            {bio.length}/{bioMax}
          </span>
        </div>
        <textarea
          maxLength={bioMax}
          rows={3}
          className="w-full bg-slate-950/80 border border-white/[0.06] rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-blue-500/50 transition-all resize-none placeholder:text-slate-700"
          value={bio}
          onChange={(e) => onChangeBio(e.target.value)}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 block">Location</label>
          <span className={`text-[8px] font-bold ${location.length >= locationMax ? 'text-red-500' : 'text-slate-600'}`}>
            {location.length}/{locationMax}
          </span>
        </div>
        <input
          maxLength={locationMax} 
          className="w-full bg-slate-950/80 border border-white/[0.06] rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
          value={location}
          onChange={(e) => onChangeLocation(e.target.value)}
        />
      </div>
    </div>
  );
}