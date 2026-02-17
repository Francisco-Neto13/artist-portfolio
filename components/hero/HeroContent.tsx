'use client';

import Image from 'next/image';
import { Instagram, Twitter, Mail, MapPin, Languages, Palette } from 'lucide-react';
import { ProfileData } from './types';

interface HeroContentProps {
  profile: ProfileData;
  displayText: string;
  onOpenModal: (type: 'languages' | 'hobbies') => void;
}

export default function HeroContent({ profile, displayText, onOpenModal }: HeroContentProps) {
  return (
    <div className="flex flex-col items-center text-center gap-8 w-full">

      <div className="flex flex-col items-center gap-6">
        <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full border border-blue-500/20 p-2 shadow-2xl shadow-blue-900/20">
          <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden relative">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt="Profile" fill className="object-cover" priority unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          <div className="absolute inset-0 rounded-full ring-1 ring-blue-500/10" />
        </div>

        <div className="flex gap-3">
          {(['instagram', 'twitter', 'mail'] as const).map((s) => (
            <a
              key={s}
              href={profile.social_links[s]}
              className="w-10 h-10 rounded-xl bg-blue-600/8 border border-blue-500/15 hover:border-blue-500/50 hover:bg-blue-600/20 flex items-center justify-center text-blue-400/70 hover:text-blue-400 transition-all"
            >
              {s === 'instagram' && <Instagram size={16} />}
              {s === 'twitter' && <Twitter size={16} />}
              {s === 'mail' && <Mail size={16} />}
            </a>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 max-w-2xl w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/8 border border-blue-500/15 text-blue-400/80 text-[10px] font-bold uppercase tracking-[0.2em]">
          <MapPin size={10} />
          Based in {profile.location}
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter flex flex-wrap justify-center gap-x-4 leading-none">
          <span className="text-white">Hi, I'm</span>
          <span className="text-blue-500 inline-flex items-center">
            {displayText}
            {displayText.length < (profile.full_name?.length || 0) && (
              <span className="ml-1 border-r-4 border-blue-500 h-12 animate-pulse" />
            )}
          </span>
        </h1>

        <p className="text-slate-400 text-lg leading-relaxed italic">
          "{profile.bio}"
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md mt-2">
          {(['languages', 'hobbies'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onOpenModal(type)}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-blue-500/30 hover:bg-blue-500/[0.03] transition-all text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 group-hover:bg-blue-600/20 transition-all">
                {type === 'languages' ? <Languages size={16} /> : <Palette size={16} />}
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1">{type}</p>
                <p className="text-slate-300 text-xs font-medium truncate">
                  {profile[type]?.length > 0
                    ? profile[type].slice(0, 2).map((i) => i.label).join(', ') + (profile[type].length > 2 ? '...' : '')
                    : 'Nothing added yet'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}