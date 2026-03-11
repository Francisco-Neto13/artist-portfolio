import 'server-only';

function parseAdminIds(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

function getConfiguredAdminIds(): string[] {
  return parseAdminIds(process.env.ADMIN_USER_IDS);
}

export function isAdminUserId(userId?: string | null): boolean {
  if (!userId) return false;
  return getConfiguredAdminIds().includes(userId);
}
