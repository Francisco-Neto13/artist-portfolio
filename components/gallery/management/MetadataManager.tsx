'use client';
import { useState } from 'react';

interface MetadataManagerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: { id: string, name: string }[];
  onAdd: (name: string) => Promise<void>;
  onRemove: (id: string, name: string) => Promise<void>;
  onSwitchType?: (type: 'category' | 'theme') => void;
  activeType?: 'category' | 'theme';
  onCheckCount?: (id: string, name: string) => Promise<number>;
}

type Toast = { id: number; message: string; type: 'success' | 'error' | 'warning' };
type ConfirmState = { id: string; name: string; artworkCount?: number } | null;

export default function MetadataManager({
  isOpen,
  onClose,
  title,
  items,
  onAdd,
  onRemove,
  onSwitchType,
  activeType = 'category',
  onCheckCount
}: MetadataManagerProps) {
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  if (!isOpen) return null;

  const pushToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setIsSubmitting(true);
    try {
      await onAdd(newName.trim());
      pushToast(`"${newName.trim()}" added successfully.`, 'success');
      setNewName('');
    } catch {
      pushToast('Failed to add. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  const requestRemove = async (id: string, name: string) => {
    const count = onCheckCount ? await onCheckCount(id, name) : 0;
    setConfirmState({ id, name, artworkCount: count });
  };

  const confirmRemove = async () => {
    if (!confirmState) return;
    const { id, name } = confirmState;
    setConfirmState(null);
    setRemovingId(id);
    try {
      await onRemove(id, name);
      pushToast(`"${name}" was removed.`, 'warning');
    } catch (err: any) {
      if (err?.message?.startsWith('in_use')) {
        const count = err.message.split(':')[1];
        pushToast(`"${name}" is linked to ${count} artwork${Number(count) !== 1 ? 's' : ''} and cannot be deleted.`, 'error');
      } else {
        pushToast('Something went wrong. Please try again.', 'error');
      }
    } finally {
      setRemovingId(null);
    }
  };

  const toastStyles: Record<Toast['type'], string> = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    error:   'border-red-500/30 bg-red-500/10 text-red-300',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  };

  const ToastIcon = ({ type }: { type: Toast['type'] }) => {
    if (type === 'success') return (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
    if (type === 'error') return (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
    return (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
      </svg>
    );
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[400] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-[11px] font-medium tracking-wide shadow-xl animate-in slide-in-from-bottom-2 duration-300 ${toastStyles[toast.type]}`}
          >
            <ToastIcon type={toast.type} />
            {toast.message}
          </div>
        ))}
      </div>

      {confirmState && (
        <div
          className="fixed inset-0 z-[350] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-lg animate-in fade-in duration-200"
          onClick={() => setConfirmState(null)}
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

              <h3 className="text-white text-sm font-semibold tracking-wide mb-1">
                Delete {activeType}?
              </h3>
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
              <button
                onClick={() => setConfirmState(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/8 text-slate-400 hover:text-white hover:border-white/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl"
        onClick={onClose}
      >
        <div
          className="relative bg-slate-900/80 border border-white/[0.06] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
          style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.7)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

          <div className="px-6 pt-6 pb-5">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Manage</p>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {onSwitchType && (
            <>
              <div className="px-6 pb-5">
                <div className="flex gap-1 p-1 bg-slate-950/60 rounded-xl border border-white/5">
                  {(['category', 'theme'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => onSwitchType(type)}
                      className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${
                        activeType === type
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {type === 'category' ? 'Categories' : 'Themes'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mx-6" />
            </>
          )}

          <div className="px-6 pt-5 pb-6 space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`New ${activeType} name...`}
                className="flex-1 bg-slate-950/80 border border-white/[0.06] rounded-xl px-4 py-3 text-white text-xs placeholder:text-slate-700 outline-none focus:border-blue-500/50 focus:bg-slate-950 transition-all"
              />
              <button
                onClick={handleAdd}
                disabled={isSubmitting || !newName.trim()}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-lg shadow-blue-500/20"
              >
                {isSubmitting ? (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </button>
            </div>

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
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-4 py-3.5 group hover:bg-white/[0.02] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-1 rounded-full bg-blue-500/40 group-hover:bg-blue-400 transition-colors" />
                        <span className="text-slate-300 text-xs font-medium tracking-wide group-hover:text-white transition-colors">
                          {item.name}
                        </span>
                      </div>
                      <button
                        onClick={() => requestRemove(item.id, item.name)}
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

            <p className="text-[10px] text-slate-500 text-center tracking-widest uppercase">
              {items.length} {items.length === 1 ? activeType : `${activeType}s`}
            </p>

          </div>
        </div>
      </div>
    </>
  );
}