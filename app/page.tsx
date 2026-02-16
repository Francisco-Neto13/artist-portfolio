import Navbar from '@/components/Navbar';
import Gallery from '@/components/Gallery';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <section className="max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <h2 className="text-blue-500 font-mono text-sm tracking-[0.3em] uppercase mb-4">
              Visual Portfolio
            </h2>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-8">
              Creative works <br /> 
              <span className="text-blue-600">by Atmisuki.</span>
            </h1>
            <p className="text-slate-400 text-xl max-w-xl leading-relaxed">
              A collection of daily illustrations, digital art, and personal projects.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-24">
          <Gallery />
        </section>
      </main>
    </div>
  );
}