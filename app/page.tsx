'use client';
import Hero from '@/components/hero/Hero';
import Gallery from '@/components/gallery/Gallery';
import CommissionSection from '@/components/commissions/CommissionSection'; 

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950">
      <div className="animate-reveal">
        <Hero />
      </div>
      <section className="pb-12 md:pb-24 border-t border-blue-900/20 pt-10 md:pt-16">
        <Gallery />
      </section>
      <section className="border-t border-blue-900/20">
        <CommissionSection />
      </section>
    </main>
  );
}