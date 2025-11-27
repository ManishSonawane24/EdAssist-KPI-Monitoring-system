const API_BASE = (import.meta as any).env?.VITE_API_URL_BASE || 'http://localhost:5000/api';

const headers = {
  'Content-Type': 'application/json',
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const message = (await response.json().catch(() => null))?.message || 'Request failed';
    throw new Error(message);
  }
  return response.json();
};

export const register = async (payload: { name: string; email: string; password: string }) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  return handleResponse(res);
};

export const login = async (payload: { email: string; password: string }) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  return handleResponse(res);
};

export const getCurrentUser = async (token: string) => {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { ...headers, Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  return handleResponse(res);
};

export const logout = async () => {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers,
    credentials: 'include',
  });
  return handleResponse(res);
};

export const getGoogleOAuthUrl = () => `${API_BASE}/auth/google`;

