import React, { useState, useEffect } from 'react';
import HeroBanner from '@/components/HeroBanner';
import ContentRow from '@/components/ContentRow';
import SkeletonCard from '@/components/SkeletonCard';
import type { Content, Category } from '@/types';

/** Mock data for demo — replace with API calls */
const mockContent = (id: string, title: string, genre: string[]): Content => ({
  id,
  title,
  description: 'Una historia cautivadora que no querrás dejar de ver. Con un elenco extraordinario y una trama llena de giros inesperados.',
  type: Math.random() > 0.5 ? 'MOVIE' : 'SERIES',
  genre,
  year: 2020 + Math.floor(Math.random() * 5),
  duration: 90 + Math.floor(Math.random() * 60),
  rating: 3.5 + Math.random() * 1.5,
  posterUrl: `https://picsum.photos/seed/${id}/400/600`,
  bannerUrl: `https://picsum.photos/seed/${id}-banner/1920/1080`,
  videoUrl: '',
  active: true,
  views: Math.floor(Math.random() * 100000),
  createdAt: new Date().toISOString(),
});

const mockCategories: Category[] = [
  { id: '1', name: '🔥 Tendencias', contents: Array.from({ length: 10 }, (_, i) => mockContent(`trend-${i}`, `Tendencia ${i + 1}`, ['Acción'])) },
  { id: '2', name: '🎬 Películas de Acción', contents: Array.from({ length: 10 }, (_, i) => mockContent(`action-${i}`, `Acción ${i + 1}`, ['Acción'])) },
  { id: '3', name: '😂 Comedias', contents: Array.from({ length: 10 }, (_, i) => mockContent(`comedy-${i}`, `Comedia ${i + 1}`, ['Comedia'])) },
  { id: '4', name: '🎭 Drama', contents: Array.from({ length: 10 }, (_, i) => mockContent(`drama-${i}`, `Drama ${i + 1}`, ['Drama'])) },
  { id: '5', name: '👻 Terror', contents: Array.from({ length: 10 }, (_, i) => mockContent(`horror-${i}`, `Terror ${i + 1}`, ['Terror'])) },
  { id: '6', name: '📺 Series Populares', contents: Array.from({ length: 10 }, (_, i) => mockContent(`series-${i}`, `Serie ${i + 1}`, ['Drama'])) },
];

const HomePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState<Content | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setFeatured(mockContent('featured', 'El Último Horizonte', ['Ciencia Ficción', 'Drama']));
      setCategories(mockCategories);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div>
        <SkeletonCard variant="banner" />
        <div className="mt-8 space-y-8">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} variant="row" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-16">
      <HeroBanner content={featured} />
      <div className="-mt-20 relative z-10 space-y-2 pb-12">
        {categories.map((cat) => (
          <ContentRow key={cat.id} title={cat.name} contents={cat.contents} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
