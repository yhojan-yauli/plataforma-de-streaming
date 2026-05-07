import api, { rawApi } from './api';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '@/types';

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await rawApi.post<AuthResponse>('auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await rawApi.post<AuthResponse>('auth/register', data);
    return response.data;
  },

  loginWithGoogle: async (token: string) => {
    const response = await rawApi.post<AuthResponse>('auth/google', { token });
    return response.data;
  },

  logout: (refreshToken: string) =>
    rawApi.post<{ message: string }>('auth/logout', { refreshToken }),

  refreshToken: async (refreshToken: string) => {
    const response = await rawApi.post<AuthResponse>('auth/refresh', { refreshToken });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get<User>('auth/me');
    return response.data;
  },

  forgotPassword: (email: string) =>
    rawApi.post('auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    rawApi.post('auth/reset-password', { token, password }),
};
