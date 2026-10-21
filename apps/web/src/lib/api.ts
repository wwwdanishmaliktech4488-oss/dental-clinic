const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If token expired or invalid, kick them to login
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/admin';
    return;
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}