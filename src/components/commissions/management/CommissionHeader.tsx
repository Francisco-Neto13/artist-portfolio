import { Plus } from 'lucide-react';
import { CommissionStatus } from '../types';
import StatusBadge from '../StatusBadge';

interface Props {
  status: CommissionStatus;
  isAdmin: boolean;
  onToggle: () => void;
  onAdd: () => void;
}

export default function CommissionHeader({ status, isAdmin, onToggle, onAdd }: Props) {
  return (
    <div className="mb-10 md:mb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
        <div className="flex flex-col">
          <StatusBadge status={status} isAdmin={isAdmin} onToggle={onToggle} />
          <h2 className="text-3xl md:text-6xl font-bold tracking-tighter text-white mt-4 md:mt-6">
            Commission Tiers
          </h2>
          <p className="text-slate-500 text-sm mt-2 md:mt-3 tracking-wide">
            Choose the service level that fits your project
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full transition-all font-bold text-[9px] uppercase tracking-[0.25em] cursor-pointer bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:border-blue-500/30 hover:text-slate-300"
          >
            <Plus size={12} />
            Add New Tier
          </button>
        )}
      </div>
    </div>
  );
}