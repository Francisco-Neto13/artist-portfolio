'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { storagePathFromPublicUrl } from '@/lib/storagePaths';
import { useAdminStatus } from '@/components/providers/AdminStatusProvider';
import { mensagemDeErro, useToast } from '@/components/providers/ToastProvider';
import { getSiteProfile, updateSiteCommissionStatus } from '@/lib/profile';
import { Commission, CommissionStatus } from './types';
import type { SiteProfile } from '@/lib/profileTypes';
import EditCommissionModal from './management/EditCommissionModal';
import CommissionHeader from './management/CommissionHeader';
import CommissionGrid from './management/CommissionGrid';
import CommissionContact from './display/CommissionContact';
import CommissionDeleteModal from './display/CommissionDeleteModal';

interface CommissionSectionProps {
  initialTiers: Commission[];
  /**
   * O status vem daqui. Antes o estado comecava em 'open' fixo, entao um
   * artista de commissions FECHADAS aparecia como aberto por ~2,7s — e era
   * "Open" que ficava no HTML servido.
   */
  initialProfile: SiteProfile | null;
}

export default function CommissionSection({ initialTiers, initialProfile }: CommissionSectionProps) {
  const { isAdmin } = useAdminStatus();
  const [commissions, setCommissions] = useState<Commission[]>(initialTiers);
  const [socialLinks, setSocialLinks] = useState<{instagram: string, twitter: string, mail: string} | null>(
    initialProfile?.social_links ?? null
  );
  const [status, setStatus] = useState<CommissionStatus>(initialProfile?.commission_status ?? 'open');
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { pushToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [{ data: tiers, error }, profile] = await Promise.all([
        supabase.from('commission_tiers').select('*').order('order_index', { ascending: true }),
        getSiteProfile(),
      ]);

      if (error) throw error;
      if (tiers) setCommissions(tiers);

      if (profile) {
        if (profile.commission_status) setStatus(profile.commission_status);
        if (profile.social_links) setSocialLinks(profile.social_links);
      }
    } catch (err) {
      console.error('Failed to load commissions:', err);
      pushToast(mensagemDeErro(err, 'Could not load commissions.'), 'error');
    }
  }, [pushToast]);

  const handleAdd = async () => {
    const maxOrder = Math.max(...commissions.map(c => c.order_index), -1);
    const { data, error } = await supabase.from('commission_tiers').insert([{
      title: 'New Service', price: '0', description: "Describe what's included...",
      image_url: null, is_active: true, order_index: maxOrder + 1
    }]).select();

    if (error || !data?.[0]) {
      console.error('Failed to create tier:', error);
      pushToast(mensagemDeErro(error, 'Could not create the tier.'), 'error');
      return;
    }

    setCommissions([...commissions, data[0]]);
  };

  const handleUpdate = async (id: string, updates: Partial<Commission>) => {
    const { error } = await supabase.from('commission_tiers').update(updates).eq('id', id);

    if (error) {
      console.error('Failed to update tier:', error);
      pushToast(mensagemDeErro(error, 'Could not save this tier.'), 'error');
      return;
    }

    setCommissions(commissions.map(c => c.id === id ? { ...c, ...updates } : c));
    pushToast('Commission tier updated successfully', 'success');
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const commission = commissions.find(c => c.id === deletingId);
    const { error } = await supabase.from('commission_tiers').delete().eq('id', deletingId);

    if (error) {
      console.error('Failed to delete tier:', error);
      pushToast(mensagemDeErro(error, 'Could not delete this tier.'), 'error');
      setDeletingId(null);
      return;
    }

    // So depois que o banco confirmou: antes o card sumia da tela mesmo quando
    // a RLS recusava, e voltava no proximo reload.
    const caminhoAntigo = storagePathFromPublicUrl(commission?.image_url, 'gallery');
    if (caminhoAntigo) await supabase.storage.from('gallery').remove([caminhoAntigo]);
    setCommissions(commissions.filter(c => c.id !== deletingId));
    pushToast('Commission tier deleted', 'warning');
    setDeletingId(null);
  };

  const toggleStatus = async () => {
    const cycle: Record<CommissionStatus, CommissionStatus> = { open: 'closed', closed: 'waitlist', waitlist: 'open' };
    const newStatus = cycle[status];
    try {
      await updateSiteCommissionStatus(newStatus);
      setStatus(newStatus);
    } catch (err) {
      console.error('Failed to change commission status:', err);
      pushToast(mensagemDeErro(err, 'Could not change the commission status.'), 'error');
    }
  };

  useEffect(() => {
    // Veio tudo do servidor: nada a buscar. So cai aqui se a geracao falhou.
    if (initialProfile) return;

    const timer = setTimeout(() => {
      void fetchData();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchData, initialProfile]);

  return (
    <section id="commissions" className="relative min-h-screen bg-slate-950 border-t border-white/[0.03]">
      <div className="w-full py-16 md:py-28 px-4 md:px-16 lg:px-24">
        <CommissionHeader status={status} isAdmin={isAdmin} onToggle={toggleStatus} onAdd={handleAdd} />
        <CommissionGrid commissions={commissions} isAdmin={isAdmin} onEdit={setEditingCommission} onDelete={setDeletingId} />
        <CommissionContact socialLinks={socialLinks} status={status} />
      </div>

      {editingCommission && (
        <EditCommissionModal commission={editingCommission} onSave={handleUpdate} onClose={() => setEditingCommission(null)} />
      )}

      {deletingId && (
        <CommissionDeleteModal onConfirm={confirmDelete} onCancel={() => setDeletingId(null)} />
      )}

    </section>
  );
}
