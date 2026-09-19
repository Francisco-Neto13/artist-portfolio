'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Pencil } from 'lucide-react';
import { useAdminStatus } from '@/components/providers/AdminStatusProvider';
import { mensagemDeErro, useToast } from '@/components/providers/ToastProvider';
import { getSiteProfile, saveSiteProfile } from '@/lib/profile';
import { ProfileData, DEFAULT_PROFILE } from '@/lib/profileTypes';
import type { SiteProfile } from '@/lib/profileTypes';
import HeroContent from './display/HeroContent';
import EditPanel from './management/EditPanel';
import InfoModal from './display/InfoModal';

/** Junta o que veio do banco com os valores de reserva, sem deixar buraco. */
function comReserva(data: SiteProfile | null): ProfileData | null {
  if (!data) return null;

  return {
    ...DEFAULT_PROFILE,
    ...data,
    social_links: { ...DEFAULT_PROFILE.social_links, ...data.social_links },
    languages: data.languages ?? [],
    hobbies: data.hobbies ?? [],
  };
}

interface HeroProps {
  /**
   * Perfil carregado no servidor. Vem `null` so quando o Supabase nao respondeu
   * na geracao da pagina — ai o componente busca pelo cliente, como fazia antes.
   */
  initialProfile: SiteProfile | null;
}

export default function Hero({ initialProfile }: HeroProps) {
  const { isAdmin } = useAdminStatus();
  const { pushToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeModal, setActiveModal] = useState<null | 'languages' | 'hobbies'>(null);
  const [displayText, setDisplayText] = useState('');
  const perfilDoServidor = useMemo(() => comReserva(initialProfile), [initialProfile]);
  const [profile, setProfile] = useState<ProfileData>(perfilDoServidor ?? DEFAULT_PROFILE);
  const [draft, setDraft] = useState<ProfileData>(perfilDoServidor ?? DEFAULT_PROFILE);
  const [profileLoaded, setProfileLoaded] = useState(perfilDoServidor !== null);

  useEffect(() => {
    // Com o perfil vindo do servidor nao ha o que buscar: esta na tela desde o
    // primeiro byte. Este caminho so roda quando a geracao falhou.
    if (perfilDoServidor) return;

    const load = async () => {
      const data = await getSiteProfile();
      const nextProfile = comReserva(data);
      if (nextProfile) {
        setProfile(nextProfile);
        setDraft(nextProfile);
      }
      setProfileLoaded(true);
    };
    load();
  }, [perfilDoServidor]);

  useEffect(() => {
    if (!profileLoaded) return;
    let index = 0;
    let iv: ReturnType<typeof setInterval>;
    setDisplayText('');
    const fullText = profile.full_name || 'Atmisuki!';
    const t = setTimeout(() => {
      iv = setInterval(() => {
        if (index <= fullText.length) { setDisplayText(fullText.slice(0, index)); index++; }
        else clearInterval(iv);
      }, 100);
    }, 800);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, [profile.full_name, profileLoaded]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSiteProfile(draft);
      setProfile({ ...draft });
      setIsEditing(false);
      pushToast('Profile saved.', 'success');
    } catch (err: unknown) {
      console.error('Save failed:', err);
      // O painel fica ABERTO de proposito: fechar apagaria a edicao que nao subiu.
      pushToast(mensagemDeErro(err, 'Could not save the profile. Please try again.'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => { setDraft(profile); setIsEditing(false); };
  const onDraftChange = useCallback((newDraft: ProfileData) => setDraft(newDraft), []);

  return (
    <section id="home" className="min-h-[80vh] md:min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 relative px-4 md:px-16 lg:px-24 py-20 md:py-16">
      <div className="w-full max-w-5xl mx-auto">
        <HeroContent
          profile={profile}
          displayText={displayText}
          onOpenModal={setActiveModal}
        />
        {isAdmin && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => { setDraft(profile); setIsEditing(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.03] border border-white/[0.07] hover:border-blue-500/30 hover:bg-blue-500/[0.05] text-slate-500 hover:text-slate-300 rounded-full transition-all cursor-pointer group"
            >
              <Pencil size={12} className="group-hover:text-blue-400 transition-colors" />
              <span className="text-[9px] font-black uppercase tracking-[0.25em]">Edit Profile</span>
            </button>
          </div>
        )}
      </div>

      {isAdmin && isEditing && (
        <EditPanel draft={draft} isSaving={isSaving} onDraftChange={onDraftChange} onSave={handleSave} onCancel={handleCancel} />
      )}
      {activeModal && (
        <InfoModal type={activeModal} profile={profile} onClose={() => setActiveModal(null)} />
      )}
    </section>
  );
}
