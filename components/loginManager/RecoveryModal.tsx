"use client"
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface RecoveryModalProps {
  onClose: () => void;
}

export default function RecoveryModal({ onClose }: RecoveryModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [animate, setAnimate] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false); 

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const reveal = (delay = "") =>
    `transition-all duration-500 ease-out ${delay} ${
      animate ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-[0.98]"
    }`;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    setLoading(false);

    if (resetError) {
      if (resetError.status === 429 || resetError.message.includes("rate limit")) {
        setError("Too many attempts. Please wait a few minutes before trying again.");
        setIsBlocked(true);
      } else {
        setError("Could not send link. Check the email address.");
      }
    } else {
      setSent(true);
    }
  };

  return (
    <div className={`fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"}`}>
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />
      
      <div 
        className={`relative bg-slate-900/90 border border-white/[0.06] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden ${reveal()}`}
        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.8)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

        {!sent ? (
          <>
            <div className="p-8 text-center border-b border-white/[0.05]">
              <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Recover Access</h3>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.25em] leading-relaxed">
                Enter your email to receive a<br />secure password reset link
              </p>
            </div>

            <form onSubmit={handleReset} className="p-8 space-y-5">
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 block mb-2 ml-1">
                  Email Address
                </label>
                <input 
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="w-full bg-slate-950/60 border border-white/[0.06] p-3.5 rounded-xl text-white text-sm outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-700 cursor-text disabled:opacity-50"
                  value={email}
                  disabled={isBlocked && loading} 
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-[10px] font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading || isBlocked} 
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : isBlocked ? "Blocked" : "Send Link"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="p-8 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z"></path>
                <path d="M22 2 11 13"></path>
              </svg>
            </div>
            <h3 className="text-white font-black uppercase tracking-tight text-lg mb-3">Email Sent</h3>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em] leading-relaxed mb-8">
              If an account exists for<br />
              <span className="text-blue-400">{email.toLowerCase()}</span><br />
              you will receive a link shortly
            </p>
            <button 
              onClick={onClose}
              className="w-full bg-slate-800 hover:bg-slate-750 text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}