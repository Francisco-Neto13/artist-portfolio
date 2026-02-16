import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Gallery from '@/components/Gallery';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        
        <section className="max-w-6xl mx-auto px-6 pb-24 border-t border-blue-900/20 pt-16">
          <Gallery />
        </section>
      </main>
    </div>
  );
}