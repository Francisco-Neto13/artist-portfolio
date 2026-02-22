import { Instagram, Twitter, Mail } from 'lucide-react';

interface Props {
  links: { instagram: string; twitter: string; mail: string };
  onChange: (links: { instagram: string; twitter: string; mail: string }) => void;
}

export default function EditSocialLinks({ links, onChange }: Props) {
  return (
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
              value={links[s]}
              placeholder={`${s} URL`}
              onChange={(e) => onChange({ ...links, [s]: e.target.value })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}