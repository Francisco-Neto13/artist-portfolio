import { Instagram, Twitter, Mail } from 'lucide-react';

interface Props {
  socialLinks: { instagram: string; twitter: string; mail: string } | null;
}

export default function CommissionContact({ socialLinks }: Props) {
  return (
    <div className="mt-20 md:mt-32 text-center max-w-2xl mx-auto">
      <div className="inline-block mb-8 md:mb-10">
        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-blue-500 mb-3 md:mb-4">
          Get in Touch
        </p>
        <h3 className="text-lg md:text-2xl font-bold text-white tracking-tight">
          Ready to start your commission?
        </h3>
        <div className="h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent mt-4 md:mt-6" />
      </div>

      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        {socialLinks?.instagram && socialLinks.instagram !== '#' && (
          <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-3.5 bg-white/[0.03] border border-white/10 hover:border-pink-500/40 hover:bg-pink-500/5 text-slate-300 hover:text-white rounded-2xl transition-all cursor-pointer group"
          >
            <Instagram size={15} className="text-slate-500 group-hover:text-pink-500 transition-colors" />
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">Instagram</span>
          </a>
        )}
        {socialLinks?.twitter && socialLinks.twitter !== '#' && (
          <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-3.5 bg-white/[0.03] border border-white/10 hover:border-blue-400/40 hover:bg-blue-400/5 text-slate-300 hover:text-white rounded-2xl transition-all cursor-pointer group"
          >
            <Twitter size={15} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">Twitter / X</span>
          </a>
        )}
        {socialLinks?.mail && socialLinks.mail !== '#' && (
          <a href={`mailto:${socialLinks.mail}`}
            className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all cursor-pointer shadow-lg shadow-blue-500/20 group"
          >
            <Mail size={15} className="group-hover:scale-110 transition-transform" />
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">Send Email</span>
          </a>
        )}
      </div>

      <p className="text-[8px] md:text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] md:tracking-[0.3em] mt-8 md:mt-10">
        Typically responds within 24-48 hours
      </p>
    </div>
  );
}