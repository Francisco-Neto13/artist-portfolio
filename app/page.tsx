import Hero from '@/components/hero/Hero';
import Gallery from '@/components/gallery/display/Gallery';

export default function Home() {
  return (
    <main className="flex-grow">
      <div className="animate-reveal delay-1">
        <Hero />
      </div>
      
      <section className="max-w-6xl mx-auto px-6 pb-24 border-t border-blue-900/20 pt-16">
        <Gallery />
      </section>
    </main>
  );
}