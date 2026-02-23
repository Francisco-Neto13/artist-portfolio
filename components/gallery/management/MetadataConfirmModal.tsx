'use client';
type ConfirmState = { id: string; name: string; artworkCount?: number } | null;

interface Props {
  confirmState: ConfirmState;
  activeType: 'category' | 'theme';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function MetadataConfirmModal({ confirmState, activeType, onConfirm, onCancel }: Props) {
  if (!confirmState) return null;

  return (
    <div
      className="fixed inset-0 z-[350] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-lg animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="relative bg-slate-900 border border-white/[0.06] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.8)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
        <div className="p-6">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-white text-sm font-semibold tracking-wide mb-1">Delete {activeType}?</h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            You're about to delete{' '}
            <span className="text-slate-300 font-medium">"{confirmState.name}"</span>.
            This action cannot be undone.
          </p>
          {confirmState.artworkCount !== undefined && confirmState.artworkCount > 0 && (
            <div className="mt-3 flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <svg className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
              </svg>
              <p className="text-amber-300/80 text-[10px] leading-relaxed">
                This {activeType} is linked to{' '}
                <span className="text-amber-300 font-semibold">
                  {confirmState.artworkCount} artwork{confirmState.artworkCount !== 1 ? 's' : ''}
                </span>. Deletion will be blocked to protect existing artworks.
              </p>
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-white/8 text-slate-400 hover:text-white hover:border-white/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer shadow-lg shadow-red-500/20">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export type { ConfirmState };