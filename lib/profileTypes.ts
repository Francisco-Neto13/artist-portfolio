export const NAME_MAX = 17;
export const BIO_MAX = 200;
export const LOCATION_MAX = 30;
export const SOCIAL_MAX = 100;
export const TAG_LABEL_MAX = 20;

export type SocialLinks = {
  instagram: string;
  twitter: string;
  mail: string;
};

export type ProfileTag = {
  label: string;
  status: string;
};

export interface ProfileData {
  full_name: string;
  bio: string;
  location: string;
  avatar_url?: string;
  social_links: SocialLinks;
  languages: ProfileTag[];
  hobbies: ProfileTag[];
}

export type CommissionStatus = 'open' | 'closed' | 'waitlist';

export interface SiteProfile extends ProfileData {
  commission_status: CommissionStatus | null;
}

export const DEFAULT_PROFILE: ProfileData = {
  full_name: 'Atmisuki.',
  bio: 'A digital artist and illustrator. I specialize in character design and environmental storytelling.',
  location: 'USA',
  avatar_url: '',
  social_links: { instagram: '#', twitter: '#', mail: '#' },
  languages: [],
  hobbies: [],
};
