const ADMIN_STATUS_TTL_MS = 10_000;

let cachedAdminStatus: boolean | null = null;
let cachedAt = 0;
let inFlightAdminRequest: Promise<boolean> | null = null;

export function invalidateAdminStatusCache() {
  cachedAdminStatus = null;
  cachedAt = 0;
  inFlightAdminRequest = null;
}

export async function getAdminStatus(options?: { forceRefresh?: boolean }): Promise<boolean> {
  const forceRefresh = options?.forceRefresh ?? false;
  const now = Date.now();

  if (!forceRefresh && cachedAdminStatus !== null && now - cachedAt < ADMIN_STATUS_TTL_MS) {
    return cachedAdminStatus;
  }

  if (!forceRefresh && inFlightAdminRequest) {
    return inFlightAdminRequest;
  }

  inFlightAdminRequest = (async () => {
    try {
      const res = await fetch('/api/auth/admin-status', {
        method: 'GET',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        cachedAdminStatus = false;
        cachedAt = Date.now();
        return false;
      }

      const data = (await res.json()) as { isAdmin?: boolean };
      const isAdmin = !!data.isAdmin;
      cachedAdminStatus = isAdmin;
      cachedAt = Date.now();
      return isAdmin;
    } catch {
      cachedAdminStatus = false;
      cachedAt = Date.now();
      return false;
    } finally {
      inFlightAdminRequest = null;
    }
  })();

  return inFlightAdminRequest;
}
