'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Erro ao logar: ' + error.message);
    } else {
      router.push('/'); 
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-2xl border border-blue-900/20 w-full max-w-md">
        <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-widest text-center">Admin Access</h2>
        <input 
          type="email" 
          placeholder="E-mail" 
          className="w-full bg-black/50 border border-blue-900/20 rounded-lg p-3 text-white mb-4 outline-none focus:border-blue-500 transition-colors"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="Senha" 
          className="w-full bg-black/50 border border-blue-900/20 rounded-lg p-3 text-white mb-6 outline-none focus:border-blue-500 transition-colors"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
        >
          {loading ? 'Verificando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}