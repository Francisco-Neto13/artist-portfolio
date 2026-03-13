'use client';
import { useState, useEffect, useCallback } from 'react';
import { Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdminStatus } from '@/components/providers/AdminStatusProvider';
import { getLatestProfile, invalidateLatestProfileCache } from '@/lib/profile';
import { ProfileData, DEFAULT_PROFILE } from '@/lib/profileTypes';
import HeroContent from './display/HeroContent';
import EditPanel from './management/EditPanel';
import InfoModal from './display/InfoModal';

export default function Hero() {
  const { isAdmin } = useAdminStatus();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeModal, setActiveModal] = useState<null | 'languages' | 'hobbies'>(null);
  const [displayText, setDisplayText] = useState('');
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [draft, setDraft] = useState<ProfileData>(DEFAULT_PROFILE);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await getLatestProfile();
      if (data) {
        const nextProfile: ProfileData = {
          ...DEFAULT_PROFILE,
          ...data,
          social_links: {
            ...DEFAULT_PROFILE.social_links,
            ...data.social_links,
          },
          languages: data.languages ?? [],
          hobbies: data.hobbies ?? [],
        };
        setProfile(nextProfile);
        setDraft(nextProfile);
      }
      setProfileLoaded(true);
    };
    load();
  }, []);

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;
      const targetProfileId = profile.id ?? draft.id ?? session.user.id;
      const { error } = await supabase.from('profiles').upsert({
        id: targetProfileId, ...draft, updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      invalidateLatestProfileCache();
      setProfile({ ...draft, id: targetProfileId });
      setIsEditing(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Save failed:', message);
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
