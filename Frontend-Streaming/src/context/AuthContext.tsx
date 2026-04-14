import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '@/store';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useAuthStore();

  useEffect(() => {
    store.hydrate();
  }, []);

  const login = (token: string, user: User) => {
    store.setToken(token);
    store.setUser(user);
  };

  const logout = () => {
    store.logout();
  };

  const value: AuthContextType = {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    isAdmin: store.user?.role === 'ADMIN',
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
