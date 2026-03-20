import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

export const size = { width: 128, height: 128 };
export const contentType = 'image/png';
export const revalidate = 300;

function isSafeAvatarUrl(raw?: string | null): raw is string {
  if (!raw) return false;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
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

export default async function Icon() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from('site_profile')
    .select('avatar_url')
    .eq('slug', 'main')
    .maybeSingle();

  let imageData: string | null = null;
  const avatarUrl = data?.avatar_url ?? null;

  if (isSafeAvatarUrl(avatarUrl)) {
    try {
      const res = await fetch(avatarUrl, { cache: 'force-cache' });
      const buffer = await res.arrayBuffer();
      const pngBuffer = await sharp(Buffer.from(buffer))
        .resize(128, 128)
        .png()
        .toBuffer();
      const base64 = pngBuffer.toString('base64');
      imageData = `data:image/png;base64,${base64}`;
    } catch (err) {
      console.error('Failed to fetch avatar:', err);
      imageData = null;
    }
  }

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
