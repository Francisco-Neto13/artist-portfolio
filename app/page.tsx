'use client';

import Hero from '@/components/hero/Hero';
import Gallery from '@/components/gallery/display/Gallery';
import CommissionSection from '@/components/commissions/CommissionSection'; 

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 block"> 
      <div className="animate-reveal">
        <Hero />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 block">
        
        <section className="pb-12 md:pb-24 border-t border-blue-900/20 pt-10 md:pt-16 block">
          <Gallery />
        </section>

        <div className="animate-reveal border-t border-blue-900/20 pt-10 md:pt-16 block">
          <CommissionSection />
        </div>

      </div>
    </main>
  );
}