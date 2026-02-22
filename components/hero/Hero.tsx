'use client';
import { useState, useEffect, useCallback } from 'react';
import { Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ProfileData, DEFAULT_PROFILE } from './types';
import HeroContent from './display/HeroContent';
import EditPanel from './management/EditPanel';
import InfoModal from './display/InfoModal';

export default function Hero() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeModal, setActiveModal] = useState<null | 'languages' | 'hobbies'>(null);
  const [displayText, setDisplayText] = useState('');
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [draft, setDraft] = useState<ProfileData>(DEFAULT_PROFILE);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAdmin(!!session);
      const { data } = await supabase.from('profiles').select('*').single();
      if (data) { setProfile(data); setDraft(data); }
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
      const { error } = await supabase.from('profiles').upsert({
        id: session.user.id, ...draft, updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setProfile(draft);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Save failed:', err.message);
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