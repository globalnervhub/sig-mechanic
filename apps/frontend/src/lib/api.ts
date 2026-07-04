const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('sig_mechanic_token');
}

export function setToken(token: string) {
  window.localStorage.setItem('sig_mechanic_token', token);
}

export function clearToken() {
  window.localStorage.removeItem('sig_mechanic_token');
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Erro na requisicao (${res.status})`);
  }

  return res.json();
}
