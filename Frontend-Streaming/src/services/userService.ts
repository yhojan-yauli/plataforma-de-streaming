import api from './api';
import type { User } from '@/types';

export const userService = {
  getProfile: () =>
    api.get<User>('/user/profile'),

  updateProfile: (data: Partial<User>) =>
    api.put<User>('/user/profile', data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post<{ url: string }>('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/user/change-password', { currentPassword, newPassword }),

  requestEmailVerification: () =>
    api.post('/user/request-verification'),
};
