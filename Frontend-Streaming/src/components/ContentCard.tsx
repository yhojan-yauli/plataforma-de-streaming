import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { contentService } from '@/services/contentService';
import { useContentStore } from '@/store';
import type { Content } from '@/types';

interface ContentCardProps {
  content: Content;
  variant?: 'poster' | 'wide';
}

const ContentCard: React.FC<ContentCardProps> = ({ content, variant = 'poster' }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { myList, addToMyList, removeFromMyList } = useContentStore();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [updatingList, setUpdatingList] = useState(false);
  const isInList = myList.some((c) => c.id === content.id);

  const handleToggleList = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (updatingList) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setUpdatingList(true);

      if (isInList) {
        await contentService.removeFromMyList(content.id);
        removeFromMyList(content.id);
        toast.success('Contenido eliminado de tu lista');
      } else {
        await contentService.addToMyList(content.id);
        addToMyList(content);
        toast.success('Contenido agregado a tu lista');
      }
    } catch {
      toast.error('No se pudo actualizar tu lista');
    } finally {
      setUpdatingList(false);
    }
  };

  return (
    <div
      className={`content-card group ${variant === 'wide' ? '!w-[320px] !aspect-video' : ''}`}
      onClick={() => navigate(`/content/${content.id}`)}
    >
      {/* Poster image */}
      {!imageLoaded && <div className="skeleton-pulse absolute inset-0" />}
      <img
        src={content.posterUrl}
        alt={content.title}
        className={`h-full w-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setImageLoaded(true)}
        loading="lazy"
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background via-background/50 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <h3 className="text-sm font-bold text-foreground line-clamp-2">{content.title}</h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-0.5 text-yellow-400">
            <Star className="h-3 w-3 fill-current" /> {content.rating.toFixed(1)}
          </span>
          <span>{content.year}</span>
          <span>{content.duration} min</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/watch/${content.id}`); }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-110"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
          </button>
          <button
            onClick={(event) => void handleToggleList(event)}
            disabled={updatingList}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-muted-foreground text-foreground transition-transform hover:scale-110 hover:border-foreground"
          >
            {isInList ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
