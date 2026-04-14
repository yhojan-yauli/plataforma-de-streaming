import { create } from 'zustand';
import type { User, Subscription, Content, WatchHistory } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => {
    if (user) localStorage.setItem('auth_user', JSON.stringify(user));
    else localStorage.removeItem('auth_user');
    set({ user, isAuthenticated: !!user });
  },
  setToken: (token) => {
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
    set({ token });
  },
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
  hydrate: () => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    const user = userStr ? JSON.parse(userStr) : null;
    set({ token, user, isAuthenticated: !!token && !!user, isLoading: false });
  },
}));

interface SubscriptionState {
  subscription: Subscription | null;
  isActive: boolean;
  setSubscription: (sub: Subscription | null) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscription: null,
  isActive: false,
  setSubscription: (subscription) =>
    set({ subscription, isActive: subscription?.active ?? false }),
}));

interface ContentState {
  myList: Content[];
  continueWatching: WatchHistory[];
  searchQuery: string;
  setMyList: (list: Content[]) => void;
  addToMyList: (content: Content) => void;
  removeFromMyList: (id: string) => void;
  setContinueWatching: (items: WatchHistory[]) => void;
  setSearchQuery: (query: string) => void;
}

export const useContentStore = create<ContentState>((set) => ({
  myList: [],
  continueWatching: [],
  searchQuery: '',
  setMyList: (myList) => set({ myList }),
  addToMyList: (content) => set((s) => ({ myList: [...s.myList, content] })),
  removeFromMyList: (id) => set((s) => ({ myList: s.myList.filter((c) => c.id !== id) })),
  setContinueWatching: (continueWatching) => set({ continueWatching }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
