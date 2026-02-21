import { createPortal } from 'react-dom';
import { Trash2 } from 'lucide-react';

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function CommissionDeleteModal({ onConfirm, onCancel }: Props) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative bg-slate-900 border border-white/[0.06] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.8)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
        <div className="p-5 md:p-6">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <Trash2 size={18} className="text-red-400" />
          </div>
          <h3 className="text-white text-sm font-semibold mb-1">Delete Commission Tier?</h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            This action cannot be undone. The tier and its image will be permanently removed.
          </p>
        </div>
        <div className="px-5 md:px-6 pb-5 md:pb-6 flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-white/8 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer shadow-lg shadow-red-500/20">
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}