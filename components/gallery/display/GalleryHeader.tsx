export default function GalleryHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-16">
      <div className="animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] mb-4 md:mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Visual Archive
        </div>
        <h2 className="text-3xl md:text-6xl font-bold tracking-tighter text-white">
          Selected Artworks
        </h2>
        <p className="text-slate-500 text-xs md:text-sm mt-2 md:mt-3 tracking-wide max-w-xl">
          A curated collection of digital illustrations, character designs, and concepts.
        </p>
      </div>
    </div>
  );
}