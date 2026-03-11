const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function safeSocialUrl(raw?: string | null): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value || value === '#') return null;

  try {
    const parsed = new URL(value);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

export function safeMailto(raw?: string | null): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value || value === '#') return null;

  const mail = value.toLowerCase().startsWith('mailto:')
    ? value.slice('mailto:'.length)
    : value;

  if (!EMAIL_REGEX.test(mail)) return null;
  return `mailto:${mail}`;
}
