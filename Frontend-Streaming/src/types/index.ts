/** User roles */
export type UserRole = 'ADMIN' | 'USER';

/** Auth types */
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: 'USER' | 'ADMIN';
  emailVerified: boolean;
  active: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  refreshTokenExpiresAt: string;
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
  active: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  plan: SubscriptionPlan;
  startDate: string;
  endDate: string;
  active: boolean;
  paymentMethod: PaymentMethod | null;
  amountPaid: number;
  daysRemaining: number;
  hoursRemaining: number;
}

/** Payment types */
export type PaymentMethod = 'CARD' | 'YAPE';
export type PaymentStatus = 'SUCCESS' | 'PENDING' | 'FAILED';

export interface StripeCheckoutConfig {
  provider: 'STRIPE';
  enabled: boolean;
  publishableKey?: string | null;
  currency: string;
}

export interface CreateStripePaymentIntentRequest {
  planId: string;
}

export interface StripePaymentIntentResponse {
  paymentId: string;
  clientSecret: string;
  externalId: string;
  externalStatus: string;
  amount: number;
  currency: string;
  plan: SubscriptionPlan;
}

export interface PaymentResponse {
  id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  provider?: string;
  providerMethod?: string;
  externalId?: string;
  externalStatus?: string;
  externalStatusDetail?: string;
  createdAt: string;
  subscription?: Subscription;
}

/** User activity */
export interface WatchHistory {
  id: string;
  contentId: string;
  episodeId?: string | null;
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
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface AdminPayment {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  planId?: string;
  plan?: SubscriptionPlan;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  provider?: string;
  providerMethod?: string;
  externalId?: string;
  externalStatus?: string;
  externalStatusDetail?: string;
  createdAt: string;
  subscriptionId?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  subscriptionActive?: boolean;
}
