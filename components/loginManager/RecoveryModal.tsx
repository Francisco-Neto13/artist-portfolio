"use client"
import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface RecoveryModalProps {
  onClose: () => void;
}

export default function RecoveryModal({ onClose }: RecoveryModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    setLoading(false);
    if (resetError) {
      setError("Could not send link. Check the email address.");
    } else {
      setSent(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-2xl">
        {!sent ? (
          <form onSubmit={handleReset} className="text-center">
            <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight">Recover Access</h3>
            <p className="text-slate-400 text-[10px] mb-8 leading-relaxed uppercase font-bold tracking-[0.2em]">
              Enter your email below to receive a secure password reset link.
            </p>
            
            <input 
              type="email"
              required
              placeholder="YOUR@EMAIL.COM"
              className="w-full bg-slate-950/50 border border-white/5 p-4 rounded-xl mb-4 text-white text-center text-sm outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {error && <p className="text-red-500 text-[10px] font-black uppercase mb-4">{error}</p>}

            <button 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all text-[10px] uppercase tracking-[0.2em] disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            
            <button 
              type="button"
              onClick={onClose}
              className="mt-6 text-slate-600 hover:text-white text-[9px] font-black uppercase tracking-widest transition-colors"
            >
              Back to Login
            </button>
          </form>
        ) : (
          <div className="text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>
            </div>
            <h3 className="text-white font-black uppercase tracking-tight mb-2">Email Sent</h3>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest leading-relaxed mb-8">
              If an account exists for {email.toLowerCase()}, you will receive a link shortly.
            </p>
            <button 
              onClick={onClose}
              className="w-full bg-slate-850 hover:bg-slate-800 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}