"use client"
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import RecoveryModal from "./RecoveryModal";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/");
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields to proceed.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Invalid email or password. Please check your credentials.");
        setLoading(false);
        return;
      }

      if (data.session) {
        router.replace("/");
        router.refresh();
      }
    } catch (err) {
      setError("Connection error. Please try again later.");
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="w-full max-w-md relative z-10">
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl overflow-hidden">
        
        <div className="bg-gradient-to-r from-blue-600/10 via-slate-800/10 to-blue-600/10 border-b border-white/5 p-8 text-center">
          <div className="inline-block mb-4">
            <Link href="/" className="group block">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-blue-600/20 via-blue-400/20 to-blue-600/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-slate-950 border border-blue-500/30 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:border-blue-500/60 transition-colors overflow-hidden">
                  <Image src="/favicon.ico" alt="Logo" width={40} height={40} className="object-contain" />
                </div>
              </div>
            </Link>
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight uppercase">
            Admin <span className="text-blue-500">Panel</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Administrative Area</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} noValidate className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                Email Address
              </label>
              <input 
                type="email"
                placeholder="Enter your email"
                className="w-full bg-slate-950/50 border border-white/5 p-3 rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all text-white placeholder:text-slate-800"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  Password
                </label>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(true)}
                  className="text-[9px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-tighter transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full bg-slate-950/50 border border-white/5 p-3 pr-12 rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all text-white placeholder:text-slate-800"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-[11px] font-bold flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-[11px] uppercase tracking-[0.2em] py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Access System"
              )}
            </button>
          </form>
        </div>

        <div className="bg-slate-950/50 border-t border-white/5 px-8 py-5">
          <div className="flex items-center justify-center gap-4 text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
              <span>Secure Session</span>
            </div>
            <span>•</span>
            <span>SSL Protected</span>
          </div>
        </div>
      </div>

      {isModalOpen && <RecoveryModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}