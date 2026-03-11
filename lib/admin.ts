export async function getAdminStatus(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/admin-status', {
      method: 'GET',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return false;
    const data = await res.json() as { isAdmin?: boolean };
    return !!data.isAdmin;
  } catch {
    return false;
  }
}
