'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AdminSettings from '@/components/admin/AdminSettings';
import { LogOut, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null | undefined>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        router.push('/auth/login');
        return;
      }

      setUserName(user.email);
    };
    
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-slate-950 pt-20 md:pt-32 pb-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 md:mb-12 pb-10 md:pb-12 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)] shrink-0">
              <ShieldCheck size={24} className="md:w-7 md:h-7" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Admin Dashboard</h1>
              <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] break-all max-w-[200px] md:max-w-none">
                {userName || 'Verificando sessão...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
             <button 
              onClick={() => router.push('/')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-3 md:py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all text-[9px] md:text-[10px] font-black uppercase tracking-widest cursor-pointer group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
              <span className="hidden xs:inline">Back to Site</span>
              <span className="xs:hidden">Back</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-3 md:py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/10 cursor-pointer"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
        
        <AdminSettings />
        
      </div>
    </main>
  );
}