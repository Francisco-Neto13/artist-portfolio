import { Plus, Trash2 } from 'lucide-react';

interface Item { label: string; status: string; }

interface Props {
  type: 'languages' | 'hobbies';
  items: Item[];
  tagMax: number;
  onAdd: () => void;
  onRemove: (i: number) => void;
  onUpdate: (i: number, field: string, value: string) => void;
}

const smallInputClass = "w-full bg-slate-950/80 border border-white/[0.06] rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-800";

export default function EditListSection({ type, items, tagMax, onAdd, onRemove, onUpdate }: Props) {
  const statusMax = 30;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">{type}</label>
        <button 
          type="button" 
          onClick={onAdd} 
          className="w-6 h-6 rounded-lg bg-blue-600/20 hover:bg-blue-600 flex items-center justify-center text-blue-400 hover:text-white transition-all cursor-pointer"
        >
          <Plus size={12} />
        </button>
      </div>
      
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={`${type}-${idx}`} className="flex gap-2 items-start animate-in fade-in slide-in-from-left-2 duration-200">
            <div className="flex-1 space-y-3">
              
              <div>
                <div className="flex justify-between items-center mb-1 px-1">
                  <span className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">Title</span>
                  <span className={`text-[7px] font-bold ${item.label.length >= tagMax ? 'text-red-500' : 'text-slate-600'}`}>
                    {item.label.length}/{tagMax}
                  </span>
                </div>
                <input 
                  className={smallInputClass} 
                  value={item.label} 
                  maxLength={tagMax}
                  placeholder={type === 'languages' ? 'Language' : 'Hobby'} 
                  onChange={(e) => onUpdate(idx, 'label', e.target.value)} 
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1 px-1">
                  <span className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">
                    {type === 'languages' ? 'Level' : 'Description'}
                  </span>
                  <span className={`text-[7px] font-bold ${item.status.length >= statusMax ? 'text-red-500' : 'text-slate-600'}`}>
                    {item.status.length}/{statusMax}
                  </span>
                </div>
                <input 
                  className={`${smallInputClass} text-slate-400 text-[10px]`} 
                  value={item.status} 
                  maxLength={statusMax} 
                  placeholder={type === 'languages' ? 'Native, Fluent...' : 'Short description...'} 
                  onChange={(e) => onUpdate(idx, 'status', e.target.value)} 
                />
              </div>
            </div>
            
            <button 
              type="button" 
              onClick={() => onRemove(idx)} 
              className="w-7 h-7 mt-6 rounded-lg flex items-center justify-center text-slate-700 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer shrink-0"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}