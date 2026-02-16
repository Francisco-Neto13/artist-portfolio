const ARTWORKS = [
  { id: 1, title: 'Project Alpha', category: 'Digital', color: 'bg-slate-800' },
  { id: 2, title: 'Concept Study', category: 'Painting', color: 'bg-slate-700' },
  { id: 3, title: 'Daily Sketch', category: 'Sketch', color: 'bg-slate-600' },
  { id: 4, title: 'New Series', category: 'Digital', color: 'bg-slate-800' },
  { id: 5, title: 'Work in Progress', category: 'Conceptual', color: 'bg-slate-700' },
  { id: 6, title: 'Final Piece', category: 'Painting', color: 'bg-slate-600' },
];

export default function Gallery() {
  return (
    <div className="w-full">
      <div className="flex gap-6 mb-12 border-b border-blue-900/30 pb-4 overflow-x-auto whitespace-nowrap">
        {['All Works', 'Digital', 'Painting', 'Sketches'].map((tab) => (
          <button 
            key={tab}
            className="text-sm font-medium text-slate-400 hover:text-blue-400 transition-colors uppercase tracking-widest"
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {ARTWORKS.map((art) => (
          <div key={art.id} className="group relative cursor-pointer">
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-slate-900 border border-blue-900/20 shadow-xl transition-all duration-500 group-hover:shadow-blue-900/20 group-hover:border-blue-500/50">
              <div className={`w-full h-full ${art.color} opacity-40 group-hover:scale-110 transition-transform duration-700`} />

              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                <span className="text-blue-500 text-xs font-bold tracking-[0.2em] uppercase mb-2">
                  {art.category}
                </span>
                <h3 className="text-2xl font-light text-white tracking-tight">
                  {art.title}
                </h3>
                <div className="w-8 h-[2px] bg-blue-600 mt-4 group-hover:w-full transition-all duration-500" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}