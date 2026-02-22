import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

export const size = { width: 128, height: 128 };
export const contentType = 'image/png';
export const revalidate = 300;

export default async function Icon() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from('profiles')
    .select('avatar_url')
    .single();

  let imageData: string | null = null;

  if (data?.avatar_url) {
    try {
      const res = await fetch(data.avatar_url);
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
          <img src={imageData} width={128} height={128} style={{ width: 128, height: 128, objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 128, height: 128, background: '#3b82f6' }} />
        )}
      </div>
    ),
    { width: 128, height: 128 }
  );
}