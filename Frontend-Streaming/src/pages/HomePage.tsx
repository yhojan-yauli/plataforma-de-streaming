import React, { useEffect, useState } from 'react';
import HeroBanner from '@/components/HeroBanner';
import ContentRow from '@/components/ContentRow';
import SkeletonCard from '@/components/SkeletonCard';
import { contentService } from '@/services/contentService';
import { useContentStore } from '@/store';
import type { Content, Category } from '@/types';

const HomePage: React.FC = () => {
  const { continueWatching } = useContentStore();
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState<Content | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recommendations, setRecommendations] = useState<Content[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadHome = async () => {
      setLoading(true);

      try {
        const [featuredResponse, categoriesResponse, recommendationsResponse] = await Promise.all([
          contentService.getFeatured(),
          contentService.getCategories(),
          contentService.getRecommendations(),
        ]);

        if (cancelled) return;

        const featuredContent = featuredResponse.data;
        setFeatured(featuredContent);
        setCategories(categoriesResponse.data);
        setRecommendations(recommendationsResponse.data.filter((item) => item.id !== featuredContent.id));
        setError(null);
      } catch {
        if (cancelled) return;
        setError('No pudimos cargar el catálogo ahora mismo.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadHome();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div>
        <SkeletonCard variant="banner" />
        <div className="mt-8 space-y-8">
          {[1, 2, 3].map((item) => (
            <SkeletonCard key={item} variant="row" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-16">
      <HeroBanner content={featured} />

      <div className="relative z-10 -mt-20 space-y-2 pb-12">
        {error && (
          <div className="mx-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground md:mx-8">
            {error}
          </div>
        )}

        {continueWatching.length > 0 && (
          <ContentRow
            title="Seguir Viendo"
            contents={continueWatching.map((item) => item.content)}
          />
        )}

        {recommendations.length > 0 && (
          <ContentRow title="Recomendado para Ti" contents={recommendations} />
        )}

        {categories.map((category) => (
          <ContentRow key={category.id} title={category.name} contents={category.contents} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
