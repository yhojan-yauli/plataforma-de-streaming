import api from './api';
import type { Content, Category, Episode, UserComment, PaginatedResponse, WatchHistory } from '@/types';

export const contentService = {
  /** Get home page categories with content */
  getCategories: () =>
    api.get<Category[]>('user/content/categories'),

  /** Get featured/banner content */
  getFeatured: () =>
    api.get<Content>('user/content/featured'),

  /** Browse with filters */
  browse: (params: { genre?: string; year?: number; search?: string; type?: 'MOVIE' | 'SERIES'; page?: number; size?: number }) =>
    api.get<PaginatedResponse<Content>>('content/browse', { params }),

  /** Get single content by ID */
  getById: (id: string) =>
    api.get<Content>(`content/${id}`),

  /** Get episodes for a series */
  getEpisodes: (seriesId: string, season?: number) =>
    api.get<Episode[]>(`content/${seriesId}/episodes`, { params: { season } }),

  /** Comments */
  getComments: (contentId: string) =>
    api.get<UserComment[]>(`content/${contentId}/comments`),

  addComment: (contentId: string, data: { text: string; rating: number }) =>
    api.post<UserComment>(`content/${contentId}/comments`, data),

  /** User interactions */
  addToMyList: (contentId: string) =>
    api.post<{ message: string }>(`user/my-list/${contentId}`),

  removeFromMyList: (contentId: string) =>
    api.delete<{ message: string }>(`user/my-list/${contentId}`),

  getMyList: () =>
    api.get<Content[]>('user/my-list'),

  /** Watch history */
  getHistory: () =>
    api.get<WatchHistory[]>('user/history'),

  getContinueWatching: () =>
    api.get<WatchHistory[]>('user/continue-watching'),

  updateProgress: (contentId: string, data: { progress: number; episodeId?: string }) =>
    api.put<WatchHistory>(`user/history/${contentId}`, data),

  /** Rate content */
  rate: (contentId: string, rating: number) =>
    api.post<{ message: string }>(`content/${contentId}/rate`, { rating }),

  /** Recommendations */
  getRecommendations: () =>
    api.get<Content[]>('user/content/recommendations'),

  /** Search */
  search: (query: string) =>
    api.get<Content[]>('content/search', { params: { q: query } }),
};
