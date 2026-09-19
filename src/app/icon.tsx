import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { SITE_PROFILE_SLUG } from '@/lib/profileTypes';

export const size = { width: 128, height: 128 };
export const contentType = 'image/png';
export const revalidate = 300;

function isSafeAvatarUrl(raw: string | null | undefined, supabaseUrl: string): raw is string {
  if (!raw) return false;

  try {
    const allowedHost = new URL(supabaseUrl).hostname;
    const parsed = new URL(raw);

    return (
      parsed.protocol === 'https:' &&
      parsed.hostname === allowedHost &&
      parsed.pathname.startsWith('/storage/v1/object/public/perfil/')
    );
  } catch {
    return false;
  }
}

/**
 * Busca o avatar e devolve um PNG em data: URL, ou `null` se qualquer coisa no
 * caminho falhar.
 *
 * Este icone e gerado no BUILD (e revalidado a cada 5 min). Antes, sem as envs
 * do Supabase, o `createClient` lancava "supabaseUrl is required" e derrubava o
 * `next build` inteiro — um clone limpo nao buildava. Nenhuma falha aqui
 * justifica isso: o pior caso razoavel e o site ficar com o icone de reserva.
 */
async function buscarAvatar(): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('site_profile')
      .select('avatar_url')
      .eq('slug', SITE_PROFILE_SLUG)
      .maybeSingle();

    if (error) throw error;

    const avatarUrl = data?.avatar_url ?? null;
    if (!isSafeAvatarUrl(avatarUrl, supabaseUrl)) return null;

    const res = await fetch(avatarUrl, { cache: 'force-cache' });
    if (!res.ok) throw new Error(`avatar respondeu ${res.status}`);

    const pngBuffer = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(128, 128)
      .png()
      .toBuffer();

    return `data:image/png;base64,${pngBuffer.toString('base64')}`;
  } catch (err) {
    console.error('Failed to build the site icon, falling back:', err);
    return null;
  }
}

export default async function Icon() {
  const imageData = await buscarAvatar();

  return new ImageResponse(
    (
      <div style={{ width: 128, height: 128, borderRadius: '50%', overflow: 'hidden', display: 'flex', background: '#0f172a' }}>
        {imageData ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" src={imageData} width={128} height={128} style={{ width: 128, height: 128, objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 128, height: 128, background: '#3b82f6' }} />
        )}
      </div>
    ),
    { width: 128, height: 128 }
  );
}
