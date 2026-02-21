import { Commission } from '../types';
import CommissionCard from '../display/CommissionCard';

interface Props {
  commissions: Commission[];
  isAdmin: boolean;
  onEdit: (c: Commission) => void;
  onDelete: (id: string) => void;
}

export default function CommissionGrid({ commissions, isAdmin, onEdit, onDelete }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
      {commissions.map((commission) => (
        <CommissionCard
          key={commission.id}
          commission={commission}
          isAdmin={isAdmin}
          onEdit={() => onEdit(commission)}
          onDelete={() => onDelete(commission.id)}
        />
      ))}
    </div>
  );
}