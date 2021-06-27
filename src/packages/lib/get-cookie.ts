export function getCookie(key: string): string {
  if (typeof document === 'undefined') return '';

  const escaped = key.replace(/[-\.\\*+?\[\]{}()]/g, '\\$&');
  const regex = new RegExp(`(?:^|;\\s*)${escaped}(?:=([^;]*))?(?:;|$)`);
  const match = regex.exec(document.cookie);

  if (!match) return '';

  return decodeURIComponent(match[1] || '');
}
