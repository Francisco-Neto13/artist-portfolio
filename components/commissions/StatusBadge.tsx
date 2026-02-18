'use client';

import { CommissionStatus } from './types';

interface StatusBadgeProps {
  status: CommissionStatus;
  isAdmin: boolean;
  onToggle: () => void;
}

export default function StatusBadge({ status, isAdmin, onToggle }: StatusBadgeProps) {
  const config = {
    open: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      dot: 'bg-emerald-500',
      label: 'Open'
    },
    closed: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-400',
      dot: 'bg-red-500',
      label: 'Closed'
    },
    waitlist: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      dot: 'bg-amber-500',
      label: 'Waitlist'
    }
  };

  const current = config[status];

  return (
    <div className="flex items-center gap-3">
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${current.bg} ${current.border} ${current.text} text-[10px] font-black uppercase tracking-[0.2em]`}>
        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${current.dot}`} />
        Commissions {current.label}
      </div>

      {isAdmin && (
        <button 
          onClick={onToggle}
          className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] hover:border-blue-500/30 hover:bg-blue-500/[0.05] text-slate-500 hover:text-slate-300 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer"
        >
          Toggle
        </button>
      )}
    </div>
  );
}