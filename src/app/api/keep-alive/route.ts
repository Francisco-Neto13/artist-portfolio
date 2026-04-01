import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function isAuthorized(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) return false;

  const authorization = request.headers.get('authorization');
  return authorization === `Bearer ${expectedSecret}`;
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { ok: false, error: 'Keep-alive not configured.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { ok: false, error: 'Supabase environment is missing.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { error } = await supabase.from('site_profile').select('slug').limit(1);

  if (error) {
    console.error('[Keep Alive] Failed to query site_profile:', error.message);
    return NextResponse.json(
      { ok: false, error: 'Failed to query Supabase.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return NextResponse.json(
    { ok: true },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );
}
