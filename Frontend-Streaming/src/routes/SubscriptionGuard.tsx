import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSubscriptionStore } from '@/store';
import { useAuth } from '@/context/AuthContext';

/** Middleware: blocks access if subscription is not active (admins bypass) */
const SubscriptionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useAuth();
  const { isActive } = useSubscriptionStore();

  if (isAdmin || isActive) return <>{children}</>;

  return <Navigate to="/plans" replace />;
};

export default SubscriptionGuard;
