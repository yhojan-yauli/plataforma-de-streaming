import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { subscriptionService } from '@/services/subscriptionService';
import { useSubscriptionStore } from '@/store';

/** Middleware: blocks access if subscription is not active (admins bypass) */
const SubscriptionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, isAuthenticated } = useAuth();
  const { isActive, isLoading, hasLoaded, setLoading, setSubscription } = useSubscriptionStore();

  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated || isAdmin || hasLoaded || isLoading) {
      return () => {
        cancelled = true;
      };
    }

    const loadCurrentSubscription = async () => {
      setLoading(true);

      try {
        const response = await subscriptionService.getCurrentSubscription();

        if (cancelled) return;
        setSubscription(response);
      } catch (error) {
        if (cancelled) return;

        setSubscription(null);
      }
    };

    void loadCurrentSubscription();

    return () => {
      cancelled = true;
    };
  }, [hasLoaded, isAdmin, isAuthenticated, isLoading, setLoading, setSubscription]);

  if (isAdmin || isActive) return <>{children}</>;

  if (isLoading || (isAuthenticated && !hasLoaded)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Verificando suscripción...
      </div>
    );
  }

  return <Navigate to="/plans" replace />;
};

export default SubscriptionGuard;
