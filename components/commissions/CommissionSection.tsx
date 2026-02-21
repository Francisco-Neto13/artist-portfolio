'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Commission, CommissionStatus } from './types';
import EditCommissionModal from './management/EditCommissionModal';
import CommissionHeader from './management/CommissionHeader';
import CommissionGrid from './management/CommissionGrid';
import CommissionContact from './display/CommissionContact';
import CommissionDeleteModal from './display/CommissionDeleteModal';

export default function CommissionSection() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [socialLinks, setSocialLinks] = useState<{instagram: string, twitter: string, mail: string} | null>(null);
  const [status, setStatus] = useState<CommissionStatus>('open');
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{id: number, message: string, type: 'success' | 'warning'}[]>([]);

  useEffect(() => { fetchData(); checkAdmin(); }, []);

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
    const { data: tiers } = await supabase.from('commission_tiers').select('*').order('order_index', { ascending: true });
    if (tiers) setCommissions(tiers);
    const { data: profile } = await supabase.from('profiles').select('commission_status, social_links').single();
    if (profile) {
      if (profile.commission_status) setStatus(profile.commission_status);
      if (profile.social_links) setSocialLinks(profile.social_links);
    }
  };

  const handleAdd = async () => {
    const maxOrder = Math.max(...commissions.map(c => c.order_index), -1);
    const { data } = await supabase.from('commission_tiers').insert([{
      title: 'New Service', price: '0', description: "Describe what's included...",
      image_url: null, is_active: true, order_index: maxOrder + 1
    }]).select();
    if (data) setCommissions([...commissions, data[0]]);
  };

  const handleUpdate = async (id: string, updates: Partial<Commission>) => {
    const { error } = await supabase.from('commission_tiers').update(updates).eq('id', id);
    if (!error) {
      setCommissions(commissions.map(c => c.id === id ? { ...c, ...updates } : c));
      pushToast('Commission tier updated successfully', 'success');
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const commission = commissions.find(c => c.id === deletingId);
    await supabase.from('commission_tiers').delete().eq('id', deletingId);
    if (commission?.image_url) {
      const marker = '/gallery/commissions/';
      const idx = commission.image_url.indexOf(marker);
      if (idx !== -1) await supabase.storage.from('gallery').remove(['commissions/' + commission.image_url.substring(idx + marker.length)]);
    }
    setCommissions(commissions.filter(c => c.id !== deletingId));
    pushToast('Commission tier deleted', 'warning');
    setDeletingId(null);
  };

  const toggleStatus = async () => {
    const cycle: Record<CommissionStatus, CommissionStatus> = { open: 'closed', closed: 'waitlist', waitlist: 'open' };
    const newStatus = cycle[status];
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      await supabase.from('profiles').update({ commission_status: newStatus }).eq('id', session.user.id);
      setStatus(newStatus);
    }
  };

  return (
    <section id="commissions" className="relative min-h-screen bg-slate-950 border-t border-white/[0.03]">
      <div className="w-full py-16 md:py-28 px-4 md:px-16 lg:px-24">
        <CommissionHeader status={status} isAdmin={isAdmin} onToggle={toggleStatus} onAdd={handleAdd} />
        <CommissionGrid commissions={commissions} isAdmin={isAdmin} onEdit={setEditingCommission} onDelete={setDeletingId} />
        <CommissionContact socialLinks={socialLinks} />
      </div>

      {editingCommission && (
        <EditCommissionModal commission={editingCommission} onSave={handleUpdate} onClose={() => setEditingCommission(null)} />
      )}

      {deletingId && (
        <CommissionDeleteModal onConfirm={confirmDelete} onCancel={() => setDeletingId(null)} />
      )}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[700] flex flex-col gap-2 items-center pointer-events-none px-4 w-full max-w-sm">
        {toasts.map(toast => (
          <div key={toast.id} className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-[11px] font-medium shadow-xl animate-in slide-in-from-bottom-2 duration-300 ${
            toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            {toast.type === 'success' ? (
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" /></svg>
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </section>
  );
}