import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { contentService } from '@/services/contentService';
import { subscriptionService } from '@/services/subscriptionService';
import { useContentStore, useSubscriptionStore } from '@/store';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { setMyList, setContinueWatching } = useContentStore();
  const { setSubscription, setLoading: setSubscriptionLoading, reset: resetSubscription } = useSubscriptionStore();

  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated) {
      setMyList([]);
      setContinueWatching([]);
      resetSubscription();
      return () => {
        cancelled = true;
      };
    }

    const bootstrapContentState = async () => {
      setSubscriptionLoading(true);

      try {
        const [myListResponse, continueWatchingResponse, currentSubscription] = await Promise.all([
          contentService.getMyList(),
          contentService.getContinueWatching(),
          subscriptionService.getCurrentSubscription(),
        ]);

        if (cancelled) return;

        setMyList(myListResponse.data);
        setContinueWatching(continueWatchingResponse.data);
        setSubscription(currentSubscription);
      } catch {
        if (cancelled) return;
        setMyList([]);
        setContinueWatching([]);
        setSubscription(null);
      }
    };

    void bootstrapContentState();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, setContinueWatching, setMyList]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
