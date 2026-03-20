'use client';
interface Props {
  items: { id: string; name: string }[];
  activeType: 'category' | 'theme';
  removingId: string | null;
  onRemove: (id: string, name: string) => void;
}

export default function MetadataList({ items, activeType, removingId, onRemove }: Props) {
  return (
    <div className="rounded-xl border border-white/5 overflow-hidden bg-slate-950/40">
      {items.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-700">No {activeType}s yet</p>
        </div>
      ) : (
        <div
          className="meta-list max-h-48 overflow-y-auto divide-y divide-white/[0.04] pr-3"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(59,130,246,0.2) transparent' }}
        >
          <style>{`
            .meta-list::-webkit-scrollbar { width: 3px; }
            .meta-list::-webkit-scrollbar-track { background: transparent; margin: 6px 0; }
            .meta-list::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.2); border-radius: 999px; }
            .meta-list::-webkit-scrollbar-thumb:hover { background: rgba(59,130,246,0.4); }
          `}</style>
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-3.5 group hover:bg-white/[0.02] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-1 h-1 rounded-full bg-blue-500/40 group-hover:bg-blue-400 transition-colors" />
                <span className="text-slate-300 text-xs font-medium tracking-wide group-hover:text-white transition-colors">
                  {item.name}
                </span>
              </div>
              <button
                onClick={() => onRemove(item.id, item.name)}
                disabled={removingId === item.id}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-700 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:opacity-30"
              >
                {removingId === item.id ? (
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}