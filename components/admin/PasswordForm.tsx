import { KeyRound, Loader2, Eye, EyeOff } from 'lucide-react';

interface PasswordFormProps {
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  showNew: boolean;
  setShowNew: (val: boolean) => void;
  strength: { label: string; score: number; color: string };
  loading: boolean;
  disabled: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const PasswordForm = ({ password, setPassword, confirmPassword, setConfirmPassword, showNew, setShowNew, strength, loading, disabled, onSubmit }: PasswordFormProps) => (
  <form 
    onSubmit={onSubmit} 
    className="bg-white/[0.02] border border-white/[0.05] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] space-y-6 backdrop-blur-xl h-full flex flex-col"
  >
    <div className="flex-1 space-y-6">
      <div className="flex items-center gap-3 text-slate-400">
        <KeyRound size={18} className="md:w-5 md:h-5"/>
        <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Change Password</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-widest text-purple-500 ml-1">New Password</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl md:rounded-2xl px-4 py-3.5 md:px-5 md:py-4 text-xs md:text-sm focus:outline-none focus:border-purple-500 text-white pr-12 transition-all"
            />
            <button 
              type="button" 
              onClick={() => setShowNew(!showNew)} 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
            >
              {showNew ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
        </div>

        {password && (
          <div className="px-1 space-y-2 animate-in slide-in-from-top-1 duration-300">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Strength: {strength.label}</span>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${strength.color}`} 
                style={{ width: `${strength.score}%` }} 
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Repeat New Password</label>
          <input
            type={showNew ? "text" : "password"}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e)=>setConfirmPassword(e.target.value)}
            required
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl md:rounded-2xl px-4 py-3.5 md:px-5 md:py-4 text-xs md:text-sm focus:outline-none focus:border-purple-500 text-white transition-all"
          />
        </div>
      </div>
    </div>

    <button 
      disabled={loading || disabled || password !== confirmPassword} 
      className="w-full py-3.5 md:py-4 bg-white text-slate-950 rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-purple-500 hover:text-white transition-all disabled:opacity-20 cursor-pointer mt-6"
    >
      {loading ? <Loader2 className="animate-spin mx-auto" size={16}/> : 'Update Password'}
    </button>
  </form>
);