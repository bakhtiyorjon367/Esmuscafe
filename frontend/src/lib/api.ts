import axios from 'axios';

// In dev: use /api so Vite proxies to backend (iPhone only needs to reach :5173)
// In production: use full API URL (or VITE_API_URL)
const getBaseURL = () => {
  if (import.meta.env.DEV) return '/api';
  if (typeof window === 'undefined') return import.meta.env.VITE_API_URL || 'http://localhost:3001';
  return import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env.DEV) {
      console.log('[API]', config.method?.toUpperCase(), (config.baseURL ?? '') + (config.url ?? ''));
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response
      ? `[API] ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${error.response.status} ${error.response.statusText}`
      : `[API] ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${error.message}`;
    console.error(msg, error.response?.data ?? error.message);
    return Promise.reject(error);
  },
);

/** POST multipart/form-data with JWT (no JSON Content-Type). */
export async function postFormData<T>(path: string, formData: FormData): Promise<T> {
  const baseURL = getBaseURL();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const response = await fetch(`${baseURL}${path}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = errorText || `Request failed with ${response.status}`;
    try {
      const parsed = JSON.parse(errorText) as { message?: string | string[] };
      if (parsed.message) {
        message = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message;
      }
    } catch {
      /* keep raw text */
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export default api;
