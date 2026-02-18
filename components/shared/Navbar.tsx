'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="w-full border-b border-white/5 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-[100] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        <a 
          href="#home"
          onClick={(e) => scrollToSection(e, 'home')}
          className="group flex items-center text-xl font-black tracking-tighter text-blue-500 cursor-pointer"
        >
          <span>A</span>
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[200px] transition-all duration-500 ease-in-out opacity-0 group-hover:opacity-100">
            TMISUKI
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a 
            href="#gallery" 
            onClick={(e) => scrollToSection(e, 'gallery')}
            className="relative text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-400 transition-colors group py-1"
          >
            Gallery
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
          </a>
          
          <a 
            href="#commissions" 
            onClick={(e) => scrollToSection(e, 'commissions')}
            className="relative text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-400 transition-colors group py-1"
          >
            Commissions
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
          </a>

          <div className="w-px h-5 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-2" />

          {/* Lógica de Botão Dinâmico */}
          {isAdmin ? (
            <Link 
              href="/dashboard"
              className="group flex items-center gap-2 px-5 py-2 border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:border-blue-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-500 cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Dashboard
            </Link>
          ) : (
            <Link 
              href="/login"
              className="px-5 py-2 border border-white/10 bg-white/5 text-slate-400 hover:bg-blue-600 hover:border-blue-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-500 cursor-pointer"
            >
              Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}