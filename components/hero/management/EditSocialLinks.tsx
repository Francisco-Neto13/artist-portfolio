import { Instagram, Twitter, Mail } from 'lucide-react';

interface Props {
  links: { instagram: string; twitter: string; mail: string };
  onChange: (links: { instagram: string; twitter: string; mail: string }) => void;
  socialMax: number; 
}

export default function EditSocialLinks({ links, onChange, socialMax }: Props) {
  return (
    <div className="space-y-3">
      <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 block ml-1">
        Social Links
      </label>
      
      <div className="space-y-3">
        {(['instagram', 'twitter', 'mail'] as const).map((s) => (
          <div key={s} className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <span className="text-[8px] font-bold text-slate-600 uppercase tracking-wider">{s}</span>
              <span className={`text-[8px] font-bold ${links[s].length >= socialMax ? 'text-red-500' : 'text-slate-600'}`}>
                {links[s].length}/{socialMax}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                {s === 'instagram' && <Instagram size={13} />}
                {s === 'twitter' && <Twitter size={13} />}
                {s === 'mail' && <Mail size={14} />}
              </div>
              <input
                type={s === 'mail' ? 'email' : 'text'}
                maxLength={socialMax}
                className="flex-1 bg-slate-950/80 border border-white/[0.06] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                value={links[s]}
                placeholder={`${s.charAt(0).toUpperCase() + s.slice(1)} URL`}
                onChange={(e) => onChange({ ...links, [s]: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}