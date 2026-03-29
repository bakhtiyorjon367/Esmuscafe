import api from './api';

export interface UserAddress {
  address: string;
}

export interface User {
  id: string;
  nickname: string;
  name: string;
  role: 'admin' | 'restaurant_owner' | 'user';
  restaurantId?: string;
  addresses?: UserAddress[];
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export const login = async (nickname: string, password: string): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', { nickname, password });
  return response.data;
};

export const signup = async (nickname: string, password: string): Promise<LoginResponse> => {
  const response = await api.post('/auth/signup', { nickname, password });
  return response.data;
};

export const getProfile = async (): Promise<User> => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const saveToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const getTokenRole = (): string | null => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role ?? null;
  } catch {
    return null;
  }
};
