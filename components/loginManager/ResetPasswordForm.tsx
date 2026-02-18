"use client"
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const checkSession = async () => {
      const { data: { user }, error: sessionError } = await supabase.auth.getUser();

      if (sessionError || !user) {
        router.replace("/login");
      } else {
        setVerifying(false);
        setTimeout(() => setAnimate(true), 50);
      }
    };

    checkSession();
  }, [router]);

  const reveal = (delay = "") =>
    `transition-all duration-700 ease-out ${delay} ${
      animate ? "opacity-100 translate-y-0 blur-none" : "opacity-0 translate-y-6 blur-sm"
    }`;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    
    const { error: updateError } = await supabase.auth.updateUser({ 
      password: password 
    });

    if (updateError) {
      setError("Link expired or invalid. Please request a new one.");
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      
      await supabase.auth.signOut();
      
      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 3000);
    }
  };

  if (!mounted) return null;

  if (verifying) {
    return (
      <div className="w-full max-w-md flex flex-col items-center gap-5">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.25em]">Verifying Link...</p>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl relative z-10 overflow-hidden ${reveal()}`}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      {!success ? (
        <>
          <div className="p-8 text-center border-b border-white/[0.05]">
            <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Define New Password</h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.25em]">Secure your administrative access</p>
          </div>

          <form onSubmit={handleUpdate} className="p-8 space-y-5">
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 block mb-2 ml-1">
                New Password
              </label>
              <input 
                type="password"
                required
                placeholder="Enter new password"
                className="w-full bg-slate-950/60 border border-white/[0.06] p-3.5 rounded-xl text-white outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-700 cursor-text"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
              />
            </div>

            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 block mb-2 ml-1">
                Confirm Password
              </label>
              <input 
                type="password"
                required
                placeholder="Confirm new password"
                className="w-full bg-slate-950/60 border border-white/[0.06] p-3.5 rounded-xl text-white outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-700 cursor-text"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-[10px] font-bold flex items-center gap-2.5 animate-in fade-in duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl text-[11px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="p-8 text-center animate-in fade-in zoom-in-95 duration-700">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h3 className="text-white font-black uppercase tracking-tight text-lg mb-3">Password Updated</h3>
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.25em] leading-relaxed mb-6">
            Your credentials have<br />been secured successfully
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
            <p className="text-blue-400 text-[9px] font-black uppercase tracking-[0.25em]">Redirecting to login...</p>
          </div>
        </div>
      )}
    </div>
  );
}