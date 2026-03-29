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

export default api;
