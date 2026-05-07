import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Play, Plus, Check, Star, ArrowLeft, Clock, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import StarRating from '@/components/StarRating';
import ContentRow from '@/components/ContentRow';
import { contentService } from '@/services/contentService';
import { useContentStore } from '@/store';
import type { Content, Episode, UserComment } from '@/types';

const ContentDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { myList, addToMyList, removeFromMyList } = useContentStore();
  const [content, setContent] = useState<Content | null>(null);
  const [comments, setComments] = useState<UserComment[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [related, setRelated] = useState<Content[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingList, setUpdatingList] = useState(false);

  const isInList = content ? myList.some((item) => item.id === content.id) : false;

  useEffect(() => {
    let cancelled = false;

    const loadContent = async () => {
      if (!id) return;

      setLoading(true);

      try {
        const [contentResponse, commentsResponse, recommendationsResponse] = await Promise.all([
          contentService.getById(id),
          contentService.getComments(id),
          contentService.getRecommendations(),
        ]);

        if (cancelled) return;

        const contentData = contentResponse.data;
        setContent(contentData);
        setComments(commentsResponse.data);
        setRelated(recommendationsResponse.data.filter((item) => item.id !== contentData.id));

        if (contentData.type === 'SERIES') {
          const episodesResponse = await contentService.getEpisodes(id);
          if (!cancelled) {
            setEpisodes(episodesResponse.data);
          }
        } else {
          setEpisodes([]);
        }

        setError(null);
      } catch {
        if (cancelled) return;
        setError('No pudimos cargar este contenido.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadContent();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleToggleList = async () => {
    if (!content || updatingList) return;

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

  const handleAddComment = async () => {
    if (!id || !content) return;

    if (!commentText.trim() || !userRating) {
      toast.error('Escribe un comentario y selecciona una valoración');
      return;
    }

    try {
      setSubmittingComment(true);

      const response = await contentService.addComment(id, {
        text: commentText.trim(),
        rating: userRating,
      });

      setComments((currentComments) => [response.data, ...currentComments]);
      setCommentText('');
      setUserRating(0);
      toast.success('Comentario publicado');

      const updatedContent = await contentService.getById(id);
      setContent(updatedContent.data);
    } catch {
      toast.error('No se pudo publicar tu comentario');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Cargando contenido...
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4 text-center text-muted-foreground">
        {error ?? 'No encontramos el contenido solicitado.'}
      </div>
    );
  }

  const playTarget = content.type === 'SERIES' && episodes[0]
    ? `/watch/${content.id}?episodeId=${episodes[0].id}`
    : `/watch/${content.id}`;

  return (
    <div className="-mt-16 min-h-screen">
      <div className="relative h-[60vh]">
        <img src={content.bannerUrl || content.posterUrl} alt={content.title} className="h-full w-full object-cover" />
        <div className="hero-overlay absolute inset-0" />
        <button onClick={() => navigate(-1)} className="absolute left-4 top-20 z-10 flex items-center gap-2 text-foreground hover:text-primary">
          <ArrowLeft className="h-5 w-5" /> Volver
        </button>
      </div>

      <div className="relative z-10 mx-auto -mt-32 max-w-[1200px] px-4 md:px-8">
        <div className="flex flex-col gap-8 md:flex-row">
          <img src={content.posterUrl} alt={content.title} className="hidden h-[350px] w-[230px] rounded-lg object-cover shadow-2xl md:block" />

          <div className="flex-1">
            <h1 className="text-3xl font-black text-foreground md:text-4xl">{content.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> {content.rating.toFixed(1)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {content.year}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {content.duration} min
              </span>
              <span className="rounded-md bg-secondary px-2 py-0.5 text-xs">
                {content.type === 'MOVIE' ? 'Película' : 'Serie'}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {content.genre.map((genre) => (
                <span key={genre} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {genre}
                </span>
              ))}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{content.description}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate(playTarget)}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-bold text-primary-foreground transition-all hover:scale-105"
              >
                <Play className="h-5 w-5 fill-current" /> Reproducir
              </button>
              <button
                onClick={() => void handleToggleList()}
                disabled={updatingList}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-50"
              >
                {isInList ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {isInList ? 'En Mi Lista' : 'Mi Lista'}
              </button>
            </div>
          </div>
        </div>

        {content.type === 'SERIES' && episodes.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-xl font-bold text-foreground">Episodios</h2>
            <div className="space-y-3">
              {episodes.map((episode) => (
                <button
                  key={episode.id}
                  onClick={() => navigate(`/watch/${content.id}?episodeId=${episode.id}`)}
                  className="flex w-full items-start gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-secondary"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-secondary font-bold text-foreground">
                    T{episode.season}E{episode.episode}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground">{episode.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{episode.description}</p>
                    <span className="mt-2 block text-xs text-muted-foreground">{episode.duration} min</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12">
          <h2 className="mb-6 text-xl font-bold text-foreground">Comentarios y Valoraciones</h2>

          <div className="mb-8 rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Tu valoración:</span>
              <StarRating rating={userRating} onChange={setUserRating} />
            </div>
            <textarea
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Escribe tu comentario..."
              className="w-full rounded-lg border border-border bg-secondary p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              rows={3}
            />
            <button
              onClick={() => void handleAddComment()}
              disabled={submittingComment}
              className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {submittingComment ? 'Publicando...' : 'Publicar'}
            </button>
          </div>

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-bold text-foreground">
                      {comment.userName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-foreground">{comment.userName}</span>
                  </div>
                  <StarRating rating={comment.rating} readonly size="sm" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{comment.text}</p>
                <span className="mt-2 block text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>

          {comments.length === 0 && (
            <div className="rounded-xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
              Todavía no hay comentarios para este contenido.
            </div>
          )}
        </div>

        {related.length > 0 && (
          <div className="mt-12 pb-12">
            <ContentRow title="Contenido Similar" contents={related} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentDetailPage;
