import api from './api';
import type { AuthResponse, LoginCredentials, RegisterData } from '@/types';

export const authService = {


  login: async (credentials: LoginCredentials) => {
  const response = await api.post<AuthResponse>('auth/login', credentials);
  return response.data;
},

register: async (data: RegisterData) => {
  const response = await api.post<AuthResponse>('auth/register', data);
  return response.data;
},


  loginWithGoogle: async (token: string) => {
  const response = await api.post<AuthResponse>('/auth/google', { token });
  return response.data;
},

  logout: () => api.post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refreshToken }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};
