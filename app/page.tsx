'use client';

import Hero from '@/components/hero/Hero';
import Gallery from '@/components/gallery/display/Gallery';
import CommissionSection from '@/components/commissions/CommissionSection'; 

export default function Home() {
  return (
    <main className="flex-grow bg-slate-950">
      <div className="animate-reveal delay-1">
        <Hero />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        <section className="pb-12 md:pb-24 border-t border-blue-900/20 pt-10 md:pt-16">
          <Gallery />
        </section>

        <div className="animate-reveal delay-2 border-t border-blue-900/20 pt-10 md:pt-16">
          <CommissionSection />
        </div>

      </div>
    </main>
  );
}