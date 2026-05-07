import React, { createContext, useContext, useEffect } from 'react';
import { isSessionExpired } from '@/lib/auth-session';
import { authService } from '@/services/authService';
import { useAuthStore, useSubscriptionStore } from '@/store';
import type { AuthResponse, User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isActiveUser: boolean;
  login: (session: AuthResponse) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  syncCurrentUser: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useAuthStore();

  useEffect(() => {
    const bootstrap = async () => {
      store.hydrate();

      const currentState = useAuthStore.getState();
      const hasSession = !!currentState.token && !!currentState.user;

      if (!hasSession) {
        useSubscriptionStore.getState().reset();
        store.setLoading(false);
        return;
      }

      if (!currentState.refreshToken || isSessionExpired(currentState.refreshTokenExpiresAt)) {
        useSubscriptionStore.getState().reset();
        store.logout();
        return;
      }

      store.setLoading(true);
      const synced = await syncCurrentUser();

      if (!synced) {
        useSubscriptionStore.getState().reset();
        store.logout();
      }
    };

    void bootstrap();
  }, []);

  const login = (session: AuthResponse) => {
    useSubscriptionStore.getState().reset();
    store.setSession(session);
    store.setLoading(false);
  };

  const refreshSession = async (): Promise<boolean> => {
    const currentRefreshToken = useAuthStore.getState().refreshToken;

    if (!currentRefreshToken) {
      return false;
    }

    try {
      const response = await authService.refreshToken(currentRefreshToken);
      store.setSession(response);
      return true;
    } catch {
      return false;
    } finally {
      if (!useAuthStore.getState().isAuthenticated) {
        useSubscriptionStore.getState().reset();
      }
      store.setLoading(false);
    }
  };

  const syncCurrentUser = async (): Promise<boolean> => {
    try {
      const user = await authService.getCurrentUser();
      store.setUser(user);
      return user.active;
    } catch {
      return false;
    } finally {
      if (!useAuthStore.getState().isAuthenticated) {
        useSubscriptionStore.getState().reset();
      }
      store.setLoading(false);
    }
  };

  const logout = async () => {
    const currentRefreshToken = useAuthStore.getState().refreshToken;

    try {
      if (currentRefreshToken) {
        await authService.logout(currentRefreshToken);
      }
    } catch {
      // We still clear local session even if the backend token is already invalid.
    } finally {
      useSubscriptionStore.getState().reset();
      store.logout();
    }
  };

  const value: AuthContextType = {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    isAdmin: store.user?.role === 'ADMIN' && store.user?.active === true,
    isActiveUser: store.user?.active === true,
    login,
    logout,
    refreshSession,
    syncCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
