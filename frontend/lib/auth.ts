function setCookie(name: string, value: string, days: number) {
  document.cookie = `${name}=${value}; path=/; max-age=${days * 86400}; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

export function saveTokens(access: string, refresh: string) {
  setCookie('access_token', access, 1);
  setCookie('refresh_token', refresh, 30);
  // Also keep localStorage as fallback
  try {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  } catch {}
}

export function clearTokens() {
  deleteCookie('access_token');
  deleteCookie('refresh_token');
  try {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  } catch {}
}

export function getAccessToken(): string | null {
  // Try cookie first, then localStorage
  const cookie = getCookie('access_token');
  if (cookie) return cookie;
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem('access_token'); } catch { return null; }
}
