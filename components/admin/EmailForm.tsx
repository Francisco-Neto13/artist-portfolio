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
  <form 
    onSubmit={onSubmit} 
    className="bg-white/[0.02] border border-white/[0.05] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] space-y-6 backdrop-blur-xl flex flex-col justify-between h-full"
  >
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-slate-400">
        <Mail size={18} className="md:w-5 md:h-5"/>
        <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Change Email</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Current Email</label>
          <input 
            type="text" 
            value={currentEmail || ''} 
            disabled 
            className="w-full bg-white/5 border border-white/5 rounded-xl md:rounded-2xl px-4 py-3.5 md:px-5 md:py-4 text-xs md:text-sm text-slate-500 cursor-not-allowed opacity-60" 
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-widest text-blue-500 ml-1">New Email</label>
          <input
            type="email"
            placeholder="Enter new email address"
            value={newEmail}
            onChange={(e)=>setNewEmail(e.target.value)}
            required
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl md:rounded-2xl px-4 py-3.5 md:px-5 md:py-4 text-xs md:text-sm focus:outline-none focus:border-blue-500 text-white transition-all"
          />
        </div>
      </div>
    </div>

    <button 
      disabled={loading || disabled} 
      className="w-full py-3.5 md:py-4 bg-white text-slate-950 rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all disabled:opacity-20 cursor-pointer mt-6"
    >
      {loading ? <Loader2 className="animate-spin mx-auto" size={16}/> : 'Update Email'}
    </button>
  </form>
);