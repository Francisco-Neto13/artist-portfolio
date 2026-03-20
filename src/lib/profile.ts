import { supabase } from '@/lib/supabase';
import type { ProfileData, SiteProfile, SocialLinks, ProfileTag } from '@/lib/profileTypes';

export const SITE_PROFILE_SLUG = 'main';

type RawSiteProfile = Partial<SiteProfile> & {
  slug?: string | null;
  social_links?: Partial<SocialLinks> | null;
  languages?: ProfileTag[] | null;
  hobbies?: ProfileTag[] | null;
};

const PROFILE_TTL_MS = 10_000;

let cachedProfile: SiteProfile | null = null;
let cachedAt = 0;
let inFlightProfileRequest: Promise<SiteProfile | null> | null = null;

function normalizeSiteProfile(raw: RawSiteProfile | null): SiteProfile | null {
  if (!raw) return null;

  return {
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

function toSiteProfilePayload(profile: ProfileData, commissionStatus?: SiteProfile['commission_status']) {
  return {
    slug: SITE_PROFILE_SLUG,
    full_name: profile.full_name,
    bio: profile.bio,
    location: profile.location,
    avatar_url: profile.avatar_url ?? '',
    social_links: profile.social_links,
    languages: profile.languages,
    hobbies: profile.hobbies,
    ...(commissionStatus !== undefined ? { commission_status: commissionStatus } : {}),
    updated_at: new Date().toISOString(),
  };
}

export function invalidateSiteProfileCache() {
  cachedProfile = null;
  cachedAt = 0;
  inFlightProfileRequest = null;
}

export async function getSiteProfile(options?: { forceRefresh?: boolean }): Promise<SiteProfile | null> {
  const forceRefresh = options?.forceRefresh ?? false;
  const now = Date.now();

  if (!forceRefresh && cachedProfile && now - cachedAt < PROFILE_TTL_MS) {
    return cachedProfile;
  }

  if (!forceRefresh && inFlightProfileRequest) {
    return inFlightProfileRequest;
  }

  inFlightProfileRequest = (async () => {
    const { data, error } = await supabase
      .from('site_profile')
      .select('full_name, bio, location, avatar_url, social_links, languages, hobbies, commission_status')
      .eq('slug', SITE_PROFILE_SLUG)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const normalized = normalizeSiteProfile((data as RawSiteProfile | null) ?? null);
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

export async function saveSiteProfile(profile: ProfileData, commissionStatus?: SiteProfile['commission_status']) {
  const payload = toSiteProfilePayload(profile, commissionStatus);
  const { error } = await supabase.from('site_profile').upsert(payload, {
    onConflict: 'slug',
  });

  if (error) {
    throw error;
  }

  invalidateSiteProfileCache();

  return normalizeSiteProfile({
    ...payload,
    commission_status: commissionStatus ?? null,
  });
}

export async function updateSiteCommissionStatus(commissionStatus: NonNullable<SiteProfile['commission_status']>) {
  const { error } = await supabase
    .from('site_profile')
    .update({
      commission_status: commissionStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', SITE_PROFILE_SLUG);

  if (error) {
    throw error;
  }

  invalidateSiteProfileCache();
}
