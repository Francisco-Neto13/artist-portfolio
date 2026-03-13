import { supabase } from '@/lib/supabase';
import type { ProfileData, SocialLinks, ProfileTag } from '@/lib/profileTypes';

export type LatestProfile = ProfileData & {
  id: string;
  avatar_url: string;
  commission_status: 'open' | 'closed' | 'waitlist' | null;
};

type RawProfile = Partial<LatestProfile> & {
  social_links?: Partial<SocialLinks> | null;
  languages?: ProfileTag[] | null;
  hobbies?: ProfileTag[] | null;
};

const PROFILE_TTL_MS = 10_000;

let cachedProfile: LatestProfile | null = null;
let cachedAt = 0;
let inFlightProfileRequest: Promise<LatestProfile | null> | null = null;

function normalizeProfile(raw: RawProfile | null): LatestProfile | null {
  if (!raw?.id) return null;

  return {
    id: raw.id,
    full_name: raw.full_name ?? '',
    bio: raw.bio ?? '',
    location: raw.location ?? '',
    avatar_url: raw.avatar_url ?? '',
    social_links: {
      instagram: raw.social_links?.instagram ?? '',
      twitter: raw.social_links?.twitter ?? '',
      mail: raw.social_links?.mail ?? '',
    },
    languages: Array.isArray(raw.languages) ? raw.languages : [],
    hobbies: Array.isArray(raw.hobbies) ? raw.hobbies : [],
    commission_status: raw.commission_status ?? null,
  };
}

export function invalidateLatestProfileCache() {
  cachedProfile = null;
  cachedAt = 0;
  inFlightProfileRequest = null;
}

export async function getLatestProfile(options?: { forceRefresh?: boolean }): Promise<LatestProfile | null> {
  const forceRefresh = options?.forceRefresh ?? false;
  const now = Date.now();

  if (!forceRefresh && cachedProfile && now - cachedAt < PROFILE_TTL_MS) {
    return cachedProfile;
  }

  if (!forceRefresh && inFlightProfileRequest) {
    return inFlightProfileRequest;
  }

  inFlightProfileRequest = (async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    const normalized = normalizeProfile((data as RawProfile | null) ?? null);
    cachedProfile = normalized;
    cachedAt = Date.now();
    return normalized;
  })();

  try {
    return await inFlightProfileRequest;
  } finally {
    inFlightProfileRequest = null;
  }
}
