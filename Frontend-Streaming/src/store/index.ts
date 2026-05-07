import { create } from 'zustand';
import { clearStoredAuthSession, readStoredAuthSession, storeAuthSession } from '@/lib/auth-session';
import type { AuthResponse, User, Subscription, Content, WatchHistory } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (session: AuthResponse | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  expiresAt: null,
  refreshTokenExpiresAt: null,
  isAuthenticated: false,
  isLoading: true,
  setSession: (session) => {
    if (session) {
      storeAuthSession(session);
    } else {
      clearStoredAuthSession();
    }

    set({
      user: session?.user ?? null,
      token: session?.token ?? null,
      refreshToken: session?.refreshToken ?? null,
      expiresAt: session?.expiresAt ?? null,
      refreshTokenExpiresAt: session?.refreshTokenExpiresAt ?? null,
      isAuthenticated: !!session?.token && !!session?.user,
    });
  },
  setUser: (user) =>
    set((state) => {
      if (!state.token || !state.refreshToken || !state.expiresAt || !state.refreshTokenExpiresAt || !user) {
        clearStoredAuthSession();
        return {
          user,
          token: null,
          refreshToken: null,
          expiresAt: null,
          refreshTokenExpiresAt: null,
          isAuthenticated: false,
        };
      }

      const session: AuthResponse = {
        token: state.token,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        refreshTokenExpiresAt: state.refreshTokenExpiresAt,
        user,
      };

      storeAuthSession(session);

      return {
        user,
        isAuthenticated: true,
      };
    }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    clearStoredAuthSession();
    set({
      user: null,
      token: null,
      refreshToken: null,
      expiresAt: null,
      refreshTokenExpiresAt: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
  hydrate: () => {
    const session = readStoredAuthSession();
    set({
      user: session?.user ?? null,
      token: session?.token ?? null,
      refreshToken: session?.refreshToken ?? null,
      expiresAt: session?.expiresAt ?? null,
      refreshTokenExpiresAt: session?.refreshTokenExpiresAt ?? null,
      isAuthenticated: !!session?.token && !!session?.user,
      isLoading: false,
    });
  },
}));

interface SubscriptionState {
  subscription: Subscription | null;
  isActive: boolean;
  isLoading: boolean;
  hasLoaded: boolean;
  setSubscription: (sub: Subscription | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscription: null,
  isActive: false,
  isLoading: false,
  hasLoaded: false,
  setSubscription: (subscription) =>
    set({
      subscription,
      isActive: subscription?.active ?? false,
      isLoading: false,
      hasLoaded: true,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () =>
    set({
      subscription: null,
      isActive: false,
      isLoading: false,
      hasLoaded: false,
    }),
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
  addToMyList: (content) =>
    set((state) => {
      if (state.myList.some((item) => item.id === content.id)) {
        return state;
      }

      return { myList: [content, ...state.myList] };
    }),
  removeFromMyList: (id) => set((s) => ({ myList: s.myList.filter((c) => c.id !== id) })),
  setContinueWatching: (continueWatching) => set({ continueWatching }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
