import axios from 'axios';
import { clearStoredAuthSession, readStoredAuthSession, storeAuthSession } from '@/lib/auth-session';
import { useAuthStore } from '@/store';
import type { AuthResponse } from '@/types';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/** Base API instance configured for the Spring Boot backend */
export const rawApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

let refreshPromise: Promise<string | null> | null = null;

const isAuthEndpoint = (url?: string) => {
  if (!url) return false;
  return ['auth/login', 'auth/register', 'auth/refresh', 'auth/logout'].some((path) => url.includes(path));
};

const redirectToLogin = () => {
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

const refreshAccessToken = async (): Promise<string | null> => {
  const session = readStoredAuthSession();

  if (!session?.refreshToken) {
    useAuthStore.getState().logout();
    return null;
  }

  try {
    const response = await rawApi.post<AuthResponse>('auth/refresh', {
      refreshToken: session.refreshToken,
    });

    storeAuthSession(response.data);
    useAuthStore.getState().setSession(response.data);
    return response.data.token;
  } catch {
    useAuthStore.getState().logout();
    return null;
  }
};

/** Request interceptor: attach JWT token */
api.interceptors.request.use((config) => {
  const session = readStoredAuthSession();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

/** Response interceptor: handle 401 and errors */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    if (originalRequest._retry || isAuthEndpoint(originalRequest.url)) {
      useAuthStore.getState().logout();
      redirectToLogin();
      return Promise.reject(error);
    }

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;

    if (!newToken) {
      redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    originalRequest.headers.Authorization = `Bearer ${newToken}`;

    return api(originalRequest);
  }
);

export default api;
