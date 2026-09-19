import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { SITE_PROFILE_SLUG } from '@/lib/profileTypes';
import type { SiteProfile } from '@/lib/profileTypes';
import type { Artwork, ArtworkCategory, ArtworkType } from '@/components/gallery/types';
import type { Commission } from '@/components/commissions/types';

/**
 * Carrega no SERVIDOR tudo que a home mostra.
 *
 * Antes as tres secoes buscavam no `useEffect`, e por isso o HTML servido saia
 * com os valores de espera: "USA" e a bio generica do DEFAULT_PROFILE, "No
 * artworks found" e o badge de commission em "Open". Medido num build de
 * producao, o dado falso ficava ~2,7s na tela — e era ele que ia para o
 * buscador, porque o HTML estatico nunca continha o dado real.
 *
 * Com o fetch aqui, a pagina ja nasce certa. Os componentes continuam client
 * (filtros, lightbox, edicao do admin): mudou de onde vem o estado INICIAL.
 *
 * ⚠️ Nada aqui lanca. Se o Supabase estiver fora, ou se as envs faltarem (a CI
 * builda de proposito com credencial de mentira), a funcao devolve vazio e os
 * componentes caem no fetch pelo cliente, como faziam antes. Uma falha de rede
 * no build nao pode derrubar o site inteiro.
 */

export type DadosIniciais = {
  profile: SiteProfile | null;
  artworks: Artwork[];
  categories: ArtworkCategory[];
  types: ArtworkType[];
  tiers: Commission[];
};

const VAZIO: DadosIniciais = {
  profile: null,
  artworks: [],
  categories: [],
  types: [],
  tiers: [],
};

function normalizeSiteProfile(raw: Record<string, unknown> | null): SiteProfile | null {
  if (!raw) return null;

  const social = (raw.social_links ?? {}) as Partial<SiteProfile['social_links']>;

  return {
    full_name: (raw.full_name as string) ?? '',
    bio: (raw.bio as string) ?? '',
    location: (raw.location as string) ?? '',
    avatar_url: (raw.avatar_url as string) ?? '',
    social_links: {
      instagram: social.instagram ?? '',
      twitter: social.twitter ?? '',
      mail: social.mail ?? '',
    },
    languages: Array.isArray(raw.languages) ? raw.languages : [],
    hobbies: Array.isArray(raw.hobbies) ? raw.hobbies : [],
    commission_status: (raw.commission_status as SiteProfile['commission_status']) ?? null,
  };
}

export async function carregarDadosIniciais(): Promise<DadosIniciais> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return VAZIO;

  try {
    // Sem sessao: tudo aqui e leitura publica, coberta pelas policies de
    // `public_read_*`. A anon key basta, e e a mesma que o browser usa.
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const [perfil, obras, categorias, temas, tiers] = await Promise.all([
      supabase
        .from('site_profile')
        .select('full_name, bio, location, avatar_url, social_links, languages, hobbies, commission_status')
        .eq('slug', SITE_PROFILE_SLUG)
        .maybeSingle(),
      supabase.from('artworks').select('*').order('created_at', { ascending: false }),
      supabase.from('artwork_categories').select('*').order('name'),
      supabase.from('artwork_types').select('*').order('name'),
      supabase.from('commission_tiers').select('*').order('order_index', { ascending: true }),
    ]);

    return {
      profile: normalizeSiteProfile(perfil.data as Record<string, unknown> | null),
      artworks: (obras.data as Artwork[] | null) ?? [],
      categories: (categorias.data as ArtworkCategory[] | null) ?? [],
      types: (temas.data as ArtworkType[] | null) ?? [],
      tiers: (tiers.data as Commission[] | null) ?? [],
    };
  } catch (err) {
    console.error('Falha ao carregar os dados iniciais no servidor:', err);
    return VAZIO;
  }
}
