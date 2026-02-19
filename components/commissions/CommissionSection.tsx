'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; 
import { supabase } from '@/lib/supabase';
import { Plus, Instagram, Twitter, Mail } from 'lucide-react'; 
import { Commission, CommissionStatus } from './types';
import CommissionCard from './CommissionCard';
import StatusBadge from './StatusBadge';
import EditCommissionModal from './EditCommissionModal';

export default function CommissionSection() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [socialLinks, setSocialLinks] = useState<{instagram: string, twitter: string, mail: string} | null>(null);

  const [status, setStatus] = useState<CommissionStatus>('open');
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{id: number, message: string, type: 'success' | 'warning'}[]>([]);

  useEffect(() => {
    fetchData();
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAdmin(!!session);
  };

  const pushToast = (message: string, type: 'success' | 'warning' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const fetchData = async () => {
    const { data: tiers } = await supabase
      .from('commission_tiers')
      .select('*')
      .order('order_index', { ascending: true });
    if (tiers) setCommissions(tiers);

    const { data: profile } = await supabase
      .from('profiles')
      .select('commission_status, social_links')
      .single();
    
    if (profile) {
      if (profile.commission_status) setStatus(profile.commission_status);
      if (profile.social_links) setSocialLinks(profile.social_links);
    }
  };

  const handleAdd = async () => {
    const maxOrder = Math.max(...commissions.map(c => c.order_index), -1);
    const newTier = {
      title: 'New Service',
      price: '0',
      description: 'Describe what\'s included...',
      image_url: null,
      is_active: true,
      order_index: maxOrder + 1
    };
    const { data } = await supabase
      .from('commission_tiers')
      .insert([newTier])
      .select();
    if (data) setCommissions([...commissions, data[0]]);
  };

  const handleUpdate = async (id: string, updates: Partial<Commission>) => {
    const { error } = await supabase
      .from('commission_tiers')
      .update(updates)
      .eq('id', id);
    if (!error) {
      setCommissions(commissions.map(c => c.id === id ? { ...c, ...updates } : c));
      pushToast('Commission tier updated successfully', 'success');
    }
  };

  const requestDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const commission = commissions.find(c => c.id === deletingId);
    
    await supabase.from('commission_tiers').delete().eq('id', deletingId);
    
    if (commission?.image_url) {
      const marker = '/gallery/commissions/';
      const idx = commission.image_url.indexOf(marker);
      if (idx !== -1) {
        const path = 'commissions/' + commission.image_url.substring(idx + marker.length);
        await supabase.storage.from('gallery').remove([path]);
      }
    }
    
    setCommissions(commissions.filter(c => c.id !== deletingId));
    pushToast('Commission tier deleted', 'warning');
    setDeletingId(null);
  };

  const toggleStatus = async () => {
    const cycle: Record<CommissionStatus, CommissionStatus> = {
      open: 'closed',
      closed: 'waitlist',
      waitlist: 'open'
    };
    const newStatus = cycle[status];
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      await supabase
        .from('profiles')
        .update({ commission_status: newStatus })
        .eq('id', session.user.id);
      setStatus(newStatus);
    }
  };

  return (
    <section id="commissions" className="relative min-h-screen bg-slate-950 border-t border-white/[0.03]">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div>
            <StatusBadge status={status} isAdmin={isAdmin} onToggle={toggleStatus} />
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mt-6">
              Commission Tiers
            </h2>
            <p className="text-slate-500 text-sm mt-3 tracking-wide">
              Choose the service level that fits your project
            </p>
          </div>

          {isAdmin && (
            <button 
              onClick={handleAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all font-bold text-[9px] uppercase tracking-[0.25em] cursor-pointer bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:border-blue-500/30 hover:text-slate-300"
            >
              <Plus size={12} />
              Add New Tier
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {commissions.map((commission) => (
            <CommissionCard
              key={commission.id}
              commission={commission}
              isAdmin={isAdmin}
              onEdit={() => setEditingCommission(commission)}
              onDelete={() => requestDelete(commission.id)}
            />
          ))}
        </div>

        <div className="mt-32 text-center max-w-2xl mx-auto">
          <div className="inline-block mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-4">
              Get in Touch
            </p>
            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Ready to start your commission?
            </h3>
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent mt-6" />
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {socialLinks?.instagram && socialLinks.instagram !== '#' && (
              <a 
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3.5 bg-white/[0.03] border border-white/10 hover:border-pink-500/40 hover:bg-pink-500/5 text-slate-300 hover:text-white rounded-2xl transition-all cursor-pointer group"
              >
                <Instagram size={16} className="text-slate-500 group-hover:text-pink-500 transition-colors" />
                <span className="font-black text-[10px] uppercase tracking-[0.2em]">Instagram</span>
              </a>
            )}

            {socialLinks?.twitter && socialLinks.twitter !== '#' && (
              <a 
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3.5 bg-white/[0.03] border border-white/10 hover:border-blue-400/40 hover:bg-blue-400/5 text-slate-300 hover:text-white rounded-2xl transition-all cursor-pointer group"
              >
                <Twitter size={16} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                <span className="font-black text-[10px] uppercase tracking-[0.2em]">Twitter / X</span>
              </a>
            )}

            {socialLinks?.mail && socialLinks.mail !== '#' && (
              <a 
                href={`mailto:${socialLinks.mail}`}
                className="flex items-center gap-3 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all cursor-pointer shadow-lg shadow-blue-500/20 group"
              >
                <Mail size={16} className="group-hover:scale-110 transition-transform" />
                <span className="font-black text-[10px] uppercase tracking-[0.2em]">Send Email</span>
              </a>
            )}
          </div>
          
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em] mt-10">
            Typically responds within 24-48 hours
          </p>
        </div>
      </div>

      {editingCommission && (
        <EditCommissionModal
          commission={editingCommission}
          onSave={handleUpdate}
          onClose={() => setEditingCommission(null)}
        />
      )}

      {deletingId && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setDeletingId(null)} />
          <div 
            className="relative bg-slate-900 border border-white/[0.06] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.8)' }}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
            <div className="p-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-white text-sm font-semibold mb-1">Delete Commission Tier?</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                This action cannot be undone. The tier and its image will be permanently removed.
              </p>
            </div>
            <div className="px-6 pb-6 flex gap-2">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 rounded-xl border border-white/8 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer">
                Cancel
              </button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer shadow-lg shadow-red-500/20">
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[700] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-[11px] font-medium shadow-xl animate-in slide-in-from-bottom-2 duration-300 ${
              toast.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            {toast.type === 'success' ? (
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
              </svg>
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </section>
  );
}