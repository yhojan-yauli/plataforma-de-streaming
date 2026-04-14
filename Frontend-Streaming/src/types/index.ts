/** User roles */
export type UserRole = 'ADMIN' | 'USER';

/** Auth types */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

/** Content types */
export interface Content {
  id: string;
  title: string;
  description: string;
  type: 'MOVIE' | 'SERIES';
  genre: string[];
  year: number;
  duration: number; // minutes
  rating: number;
  posterUrl: string;
  bannerUrl: string;
  videoUrl: string;
  trailerUrl?: string;
  active: boolean;
  views: number;
  createdAt: string;
}

export interface Episode {
  id: string;
  seriesId: string;
  season: number;
  episode: number;
  title: string;
  description: string;
  duration: number;
  videoUrl: string;
  thumbnailUrl: string;
}

export interface Category {
  id: string;
  name: string;
  contents: Content[];
}

/** Subscription types */
export type PlanType = '1_MONTH' | '3_MONTHS' | '12_MONTHS' | 'CUSTOM';

export interface SubscriptionPlan {
  id: string;
  type: PlanType;
  months: number;
  price: number;
  currency: string;
  description: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  startDate: string;
  endDate: string;
  active: boolean;
  paymentMethod: string;
  amountPaid: number;
}

/** Payment types */
export type PaymentMethod = 'CARD' | 'MERCADO_PAGO' | 'YAPE';

export interface PaymentRequest {
  planId: string;
  method: PaymentMethod;
  amount: number;
  customMonths?: number;
}

export interface PaymentResponse {
  id: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  subscription?: Subscription;
}

/** User activity */
export interface WatchHistory {
  id: string;
  contentId: string;
  content: Content;
  progress: number; // percentage
  lastWatched: string;
}

export interface UserComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  contentId: string;
  text: string;
  rating: number;
  positive: boolean;
  createdAt: string;
}

/** Admin types */
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalContent: number;
  activeSubscriptions: number;
}

export interface SystemLog {
  id: string;
  action: string;
  userId?: string;
  details: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR';
}

/** API response wrapper */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
