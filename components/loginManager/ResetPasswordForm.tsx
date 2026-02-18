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
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user }, error: sessionError } = await supabase.auth.getUser();

      if (sessionError || !user) {
        router.replace("/login");
      } else {
        setVerifying(false);
      }
    };

    checkSession();
  }, [router]);

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

  if (verifying) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Verifying Link...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-2xl shadow-2xl relative z-10">
      <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight text-center">Define New Password</h3>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] text-center mb-8">Secure your administrative access</p>
      
      {!success ? (
        <form onSubmit={handleUpdate} className="space-y-4">
          <input 
            type="password"
            required
            placeholder="NEW PASSWORD"
            className="w-full bg-slate-950 border border-white/5 p-4 rounded-xl text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-800 text-center"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
          />
          <input 
            type="password"
            required
            placeholder="CONFIRM NEW PASSWORD"
            className="w-full bg-slate-950 border border-white/5 p-4 rounded-xl text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-800 text-center"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-[10px] font-black uppercase text-center animate-in fade-in zoom-in-95">
              {error}
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Updating Credentials..." : "Update Password"}
          </button>
        </form>
      ) : (
        <div className="text-center animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h3 className="text-white font-black uppercase tracking-tight mb-2">Password Updated</h3>
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest leading-relaxed mb-4">
            Your credentials have been secured.
          </p>
          <div className="flex items-center justify-center gap-2">
             <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
             <p className="text-blue-500 text-[9px] font-black uppercase tracking-widest">Redirecting to login...</p>
          </div>
        </div>
      )}
    </div>
  );
}