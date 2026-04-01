import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const select = vi.fn();
const limit = vi.fn();
const from = vi.fn();
const createClient = vi.fn();

const originalCronSecret = process.env.CRON_SECRET;
const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => createClient(...args),
}));

describe('GET /api/keep-alive', () => {
  beforeEach(() => {
    vi.resetModules();
    createClient.mockReset();
    from.mockReset();
    select.mockReset();
    limit.mockReset();

    process.env.CRON_SECRET = 'keep-alive-secret';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    limit.mockResolvedValue({ error: null });
    select.mockReturnValue({ limit });
    from.mockReturnValue({ select });
    createClient.mockReturnValue({ from });
  });

  afterEach(() => {
    if (originalCronSecret === undefined) {
      delete process.env.CRON_SECRET;
    } else {
      process.env.CRON_SECRET = originalCronSecret;
    }

    if (originalSupabaseUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
    }

    if (originalSupabaseAnonKey === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalSupabaseAnonKey;
    }
  });

  it('returns 503 when CRON_SECRET is missing', async () => {
    delete process.env.CRON_SECRET;

    const { GET } = await import('./route');
    const response = await GET(new Request('http://localhost/api/keep-alive'));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      ok: false,
      error: 'Keep-alive not configured.',
    });
  });

  it('returns 503 when Supabase environment is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    const { GET } = await import('./route');
    const response = await GET(
      new Request('http://localhost/api/keep-alive', {
        headers: {
          Authorization: 'Bearer keep-alive-secret',
        },
      })
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      ok: false,
      error: 'Supabase environment is missing.',
    });
  });

  it('returns 401 for unauthorized requests', async () => {
    const { GET } = await import('./route');
    const response = await GET(new Request('http://localhost/api/keep-alive'));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      ok: false,
      error: 'Unauthorized.',
    });
  });

  it('returns 200 for authorized requests with a successful query', async () => {
    const { GET } = await import('./route');
    const response = await GET(
      new Request('http://localhost/api/keep-alive', {
        headers: {
          Authorization: 'Bearer keep-alive-secret',
        },
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(createClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'anon-key',
      expect.objectContaining({
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    );
    expect(from).toHaveBeenCalledWith('site_profile');
    expect(select).toHaveBeenCalledWith('slug');
    expect(limit).toHaveBeenCalledWith(1);
  });

  it('returns 500 when the Supabase query fails', async () => {
    limit.mockResolvedValue({ error: { message: 'db down' } });

    const { GET } = await import('./route');
    const response = await GET(
      new Request('http://localhost/api/keep-alive', {
        headers: {
          Authorization: 'Bearer keep-alive-secret',
        },
      })
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      ok: false,
      error: 'Failed to query Supabase.',
    });
  });
});
