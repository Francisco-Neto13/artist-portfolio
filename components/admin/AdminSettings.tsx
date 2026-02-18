'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, AlertCircle, ShieldCheck, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { EmailForm } from './EmailForm';
import { PasswordForm } from './PasswordForm';

export default function AdminSettings() {
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentEmail(user.email ?? null);
    };
    fetchUser();
  }, []);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-800' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (score <= 2) return { score: 33, label: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score: 66, label: 'Medium', color: 'bg-yellow-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
  };

  const verifyCurrentPassword = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return { error: { message: "User not found." } };
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    setVerified(!error);
    return { error };
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error: authError } = await verifyCurrentPassword();
    if (authError) {
      setMessage({ type: 'error', text: 'Current password incorrect.' });
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ email });
    if (error) setMessage({ type: 'error', text: error.message });
    else {
      setMessage({ type: 'success', text: 'Confirm the change in both emails.' });
      setEmail(''); setCurrentPassword(''); setVerified(false);
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error: authError } = await verifyCurrentPassword();
    if (authError) {
      setMessage({ type: 'error', text: 'Current password incorrect.' });
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setMessage({ type: 'error', text: error.message });
    else {
      setMessage({ type: 'success', text: 'Password updated successfully.' });
      setPassword(''); setConfirmPassword(''); setCurrentPassword(''); setVerified(false);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border animate-in slide-in-from-top-2 duration-300 ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
          <span className="text-[10px] font-black uppercase tracking-widest">{message.text}</span>
        </div>
      )}

      <div className={`relative border rounded-[2rem] p-8 transition-all duration-500 ${verified ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-blue-500/5 border-blue-500/10'}`}>
        <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
          <div className={`flex items-center gap-3 shrink-0 ${verified ? 'text-emerald-400' : 'text-blue-400'}`}>
            {verified ? <ShieldCheck size={20}/> : <ShieldAlert size={20}/>}
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black uppercase tracking-widest">{verified ? "Identity Verified" : "Your Current Password"}</span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Required for any change</span>
            </div>
          </div>
          <div className="relative w-full">
            <input
              type={showCurrent ? "text" : "password"}
              placeholder="Enter your current password to authorize"
              value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); setVerified(false); }}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all text-white placeholder:text-slate-600 pr-12"
            />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showCurrent ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EmailForm 
          currentEmail={currentEmail} 
          newEmail={email} 
          setNewEmail={setEmail} 
          loading={loading} 
          disabled={!currentPassword}
          onSubmit={handleUpdateEmail}
        />
        <PasswordForm 
          password={password} 
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          showNew={showNew}
          setShowNew={setShowNew}
          strength={getPasswordStrength(password)}
          loading={loading}
          disabled={!currentPassword}
          onSubmit={handleUpdatePassword}
        />
      </div>
    </div>
  );
}