import Image from 'next/image';
import { Instagram, Twitter, Languages, Palette, MapPin, Mail } from 'lucide-react';

export default function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
        
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-blue-600/20 p-2 shadow-2xl shadow-blue-900/30">
            <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden relative border border-blue-500/50">
              <Image 
                src="/content/avatar/profile.png" 
                alt="Atmisuki Profile"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <a href="#" className="p-3 bg-blue-600/10 rounded-full hover:bg-blue-600 hover:text-white transition-all text-blue-400 group">
              <Instagram size={20} className="group-hover:scale-110 transition-transform" />
            </a>
            <a href="#" className="p-3 bg-blue-600/10 rounded-full hover:bg-blue-600 hover:text-white transition-all text-blue-400 group">
              <Twitter size={20} className="group-hover:scale-110 transition-transform" />
            </a>
            <a href="#" className="p-3 bg-blue-600/10 rounded-full hover:bg-blue-600 hover:text-white transition-all text-blue-400 group">
              <Mail size={20} className="group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            <MapPin size={12} />
            Based in USA
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            Hi, I'm <span className="text-blue-600">Atmisuki.</span>
          </h1>
          
          <p className="text-slate-400 text-xl leading-relaxed mb-8 max-w-2xl">
            A digital artist and illustrator. I specialize in character design 
            and environmental storytelling, pushing the boundaries of color and light in every piece.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-900/5 border border-blue-800/20 hover:border-blue-500/30 transition-colors">
              <Languages className="text-blue-500 shrink-0" size={20} />
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/70">Languages</h3>
                <p className="text-slate-200 text-sm font-medium">English, Portuguese, Chinese</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-900/5 border border-blue-800/20 hover:border-blue-500/30 transition-colors">
              <Palette className="text-blue-500 shrink-0" size={20} />
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/70">Hobbies</h3>
                <p className="text-slate-200 text-sm font-medium">Gaming, Chess, Photography</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}