import { Mail, Loader2 } from 'lucide-react';

interface EmailFormProps {
  currentEmail: string | null;
  newEmail: string;
  setNewEmail: (val: string) => void;
  loading: boolean;
  disabled: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const EmailForm = ({ currentEmail, newEmail, setNewEmail, loading, disabled, onSubmit }: EmailFormProps) => (
  <form onSubmit={onSubmit} className="bg-white/[0.02] border border-white/[0.05] p-8 rounded-[2.5rem] space-y-6 backdrop-blur-xl flex flex-col justify-between h-full">
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-slate-400">
        <Mail size={20}/>
        <h3 className="text-xs font-black uppercase tracking-[0.2em]">Change Email</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Current Email</label>
          <input type="text" value={currentEmail || ''} disabled className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-slate-500 cursor-not-allowed opacity-60" />
        </div>
        
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-widest text-blue-500 ml-1">New Email</label>
          <input
            type="email"
            placeholder="Enter new email address"
            value={newEmail}
            onChange={(e)=>setNewEmail(e.target.value)}
            required
            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500 text-white"
          />
        </div>
      </div>
    </div>

    <button disabled={loading || disabled} className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all disabled:opacity-20 cursor-pointer mt-6">
      {loading ? <Loader2 className="animate-spin mx-auto" size={16}/> : 'Update Email'}
    </button>
  </form>
);