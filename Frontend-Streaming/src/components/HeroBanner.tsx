import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info } from 'lucide-react';
import type { Content } from '@/types';

interface HeroBannerProps {
  content: Content | null;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ content }) => {
  const navigate = useNavigate();

  if (!content) {
    return <div className="skeleton-pulse h-[70vh] w-full" />;
  }

  return (
    <div className="relative h-[70vh] w-full overflow-hidden md:h-[80vh]">
      <img
        src={content.bannerUrl || content.posterUrl}
        alt={content.title}
        className="h-full w-full object-cover"
      />
      <div className="hero-overlay absolute inset-0" />
      <div className="absolute bottom-16 left-0 right-0 px-4 md:bottom-24 md:px-8">
        <div className="mx-auto max-w-[1400px]">
          <h1 className="animate-fade-in text-3xl font-black text-foreground md:text-5xl lg:text-6xl">
            {content.title}
          </h1>
          <p className="mt-3 max-w-xl animate-fade-in text-sm text-muted-foreground opacity-0 [animation-delay:200ms] md:text-base line-clamp-3">
            {content.description}
          </p>
          <div className="mt-5 flex animate-fade-in items-center gap-3 opacity-0 [animation-delay:400ms]">
            <button
              onClick={() => navigate(`/watch/${content.id}`)}
              className="flex items-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-sm font-bold text-background transition-colors hover:bg-foreground/80"
            >
              <Play className="h-5 w-5 fill-current" /> Reproducir
            </button>
            <button
              onClick={() => navigate(`/content/${content.id}`)}
              className="flex items-center gap-2 rounded-md bg-secondary px-5 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-secondary/80"
            >
              <Info className="h-5 w-5" /> Más Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
