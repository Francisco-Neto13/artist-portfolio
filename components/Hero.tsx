'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Instagram, Twitter, Languages, Palette, MapPin, Mail, X } from 'lucide-react';

export default function Hero() {
  const [activeModal, setActiveModal] = useState<null | 'languages' | 'hobbies'>(null);
  const [displayText, setDisplayText] = useState('');
  const fullText = 'Atmisuki.';

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index <= fullText.length) {
          setDisplayText(fullText.slice(0, index));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 150);
      
      return () => clearInterval(interval);
    }, 1700); 

    return () => clearTimeout(startTimeout);
  }, []);

  const modalContent = {
    languages: {
      title: 'Languages',
      items: [
        { label: 'English', status: 'Native' },
        { label: 'Chinese', status: 'Native' },
        { label: 'Portuguese', status: 'Learning' },
      ]
    },
    hobbies: {
      title: 'Hobbies & Interests',
      items: [
        { label: 'Gaming', status: 'I love playing Minecraft and strategy games.' },
        { label: 'Chess', status: 'Currently 1200 ELO and climbing.' },
        { label: 'Photography', status: 'Focusing on urban and night shots.' },
      ]
    }
  };

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
            <a href="#" className="p-3 bg-blue-600/10 rounded-full hover:bg-blue-600 hover:text-white transition-all text-blue-400 group cursor-pointer">
              <Instagram size={20} className="group-hover:scale-110 transition-transform" />
            </a>
            <a href="#" className="p-3 bg-blue-600/10 rounded-full hover:bg-blue-600 hover:text-white transition-all text-blue-400 group cursor-pointer">
              <Twitter size={20} className="group-hover:scale-110 transition-transform" />
            </a>
            <a href="#" className="p-3 bg-blue-600/10 rounded-full hover:bg-blue-600 hover:text-white transition-all text-blue-400 group cursor-pointer">
              <Mail size={20} className="group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            <MapPin size={12} />
            Based in USA
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 h-[1.2em]">
            Hi, I'm <span className="text-blue-600">
              {displayText}
              {(displayText.length < fullText.length || displayText === '') && (
                <span className="animate-pulse ml-1 border-r-4 border-blue-600"></span>
              )}
            </span>
          </h1>
          
          <p className="text-slate-400 text-xl leading-relaxed mb-8 max-w-2xl">
            A digital artist and illustrator. I specialize in character design 
            and environmental storytelling, pushing the boundaries of color and light in every piece.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
            <button 
              onClick={() => setActiveModal('languages')}
              className="flex items-center gap-4 p-4 rounded-xl bg-blue-900/5 border border-blue-800/20 hover:border-blue-500/50 hover:bg-blue-900/10 transition-all text-left group cursor-pointer"
            >
              <Languages className="text-blue-500 group-hover:scale-110 transition-transform" size={20} />
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/70">Languages</h3>
                <p className="text-slate-200 text-sm font-medium">English, Chinese, Portuguese...</p>
              </div>
            </button>

            <button 
              onClick={() => setActiveModal('hobbies')}
              className="flex items-center gap-4 p-4 rounded-xl bg-blue-900/5 border border-blue-800/20 hover:border-blue-500/50 hover:bg-blue-900/10 transition-all text-left group cursor-pointer"
            >
              <Palette className="text-blue-500 group-hover:scale-110 transition-transform" size={20} />
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/70">Hobbies</h3>
                <p className="text-slate-200 text-sm font-medium">Gaming, Chess, Photography...</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer"
            onClick={() => setActiveModal(null)}
          ></div>
          
          <div className="relative bg-slate-900 border border-blue-500/30 w-full max-w-md p-8 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold text-blue-500 mb-6 uppercase tracking-tighter">
              {modalContent[activeModal].title}
            </h2>

            <div className="space-y-4">
              {modalContent[activeModal].items.map((item, idx) => (
                <div key={idx} className="border-b border-blue-900/30 pb-3">
                  <span className="text-sm font-bold text-slate-200 block">{item.label}</span>
                  <span className="text-sm text-blue-400/80">{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}