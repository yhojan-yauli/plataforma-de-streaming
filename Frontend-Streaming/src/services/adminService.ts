import api from './api';
import type { AdminStats, Content, SystemLog, User, PaginatedResponse, Subscription } from '@/types';

export const adminService = {
  /** Dashboard stats */
  getStats: () =>
    api.get<AdminStats>('/admin/stats'),

  
  /** Users */
  getUsers: async (page = 0, size = 10, search = '') => {
  const res = await api.get('/admin/users', {
    params: { page, size, search }
  });

  return res.data; // devuelve Page completo
},

  
toggleUserActive: async (userId: string): Promise<void> => {
  await api.put(`/admin/users/${userId}/status`);
},

 /** CONTENT */
getContents: async (page = 0, size = 10, search = '') => {
  const res = await api.get('/admin/content', {
    params: { page, size, search }
  });
  return res.data;
},

createContent: (data: Partial<Content>) =>
  api.post('/admin/content', data),

deleteContent: (id: string) =>
  api.delete(`/admin/content/${id}`),

toggleContentActive: (id: string) =>
  api.put(`/admin/content/${id}/status`),

  /** Subscriptions/Payments */
  getPayments: (page = 0, size = 20) =>
    api.get<PaginatedResponse<Subscription>>('/admin/payments', { params: { page, size } }),

  /** Reports */
  getMonthlyRevenue: (year: number) =>
    api.get<{ month: string; revenue: number }[]>('/admin/reports/revenue', { params: { year } }),

  getViewsReport: () =>
    api.get<{ contentId: string; title: string; views: number }[]>('/admin/reports/views'),

  /** System logs */
  getLogs: (page = 0, size = 50) =>
    api.get<PaginatedResponse<SystemLog>>('/admin/logs', { params: { page, size } }),
};
