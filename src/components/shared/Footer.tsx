import { DiscordIcon, InstagramIcon, XIcon } from '@/components/shared/BrandIcons';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/5 bg-slate-950/60 backdrop-blur-xl transition-all duration-300">
      <div className="px-4 md:px-16 lg:px-24 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center order-2 md:order-1">
            Dev by
            <a
              href="https://github.com/Francisco-Neto13"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 ml-2 hover:text-blue-400 transition-colors cursor-pointer"
            >
              Francisco
            </a>
          </div>

          <div className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] order-1 md:order-2 md:absolute md:left-1/2 md:-translate-x-1/2">
            (c) {currentYear} | <span className="text-blue-500">Atmisuki</span>
          </div>

          <div className="flex items-center gap-6 order-3">
            <a
              href="https://x.com/atmisuki"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-500 transition-all duration-300 hover:scale-110"
            >
              <XIcon size={18} />
            </a>

            <a
              href="https://www.instagram.com/atmisuki/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-500 transition-all duration-300 hover:scale-110"
            >
              <InstagramIcon size={18} />
            </a>

            <a
              href="https://discord.com/users/728516546854387762"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-[#5865F2] transition-all duration-300 hover:scale-110"
            >
              <DiscordIcon size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
