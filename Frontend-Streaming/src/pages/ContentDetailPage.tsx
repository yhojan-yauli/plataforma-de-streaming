import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Star, ArrowLeft, Clock, Calendar } from 'lucide-react';
import StarRating from '@/components/StarRating';
import ContentRow from '@/components/ContentRow';
import { useContentStore } from '@/store';
import type { Content, UserComment } from '@/types';

const mockDetail: Content = {
  id: 'detail-1',
  title: 'El Último Horizonte',
  description: 'En un futuro distante, la humanidad enfrenta su mayor desafío. Un grupo de exploradores se embarca en una misión interestelar para encontrar un nuevo hogar para la raza humana. Con impresionantes efectos visuales y una narrativa envolvente, esta película te llevará a los confines del universo.',
  type: 'MOVIE',
  genre: ['Ciencia Ficción', 'Drama', 'Aventura'],
  year: 2024,
  duration: 148,
  rating: 4.5,
  posterUrl: 'https://picsum.photos/seed/detail-1/400/600',
  bannerUrl: 'https://picsum.photos/seed/detail-1-banner/1920/1080',
  videoUrl: '',
  active: true,
  views: 150000,
  createdAt: new Date().toISOString(),
};

const mockComments: UserComment[] = Array.from({ length: 5 }, (_, i) => ({
  id: `comment-${i}`,
  userId: `user-${i}`,
  userName: `Usuario ${i + 1}`,
  contentId: 'detail-1',
  text: i % 2 === 0 ? '¡Excelente película! La recomiendo totalmente.' : 'Buena trama pero un poco larga.',
  rating: 3 + (i % 3),
  positive: i % 2 === 0,
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

const related: Content[] = Array.from({ length: 8 }, (_, i) => ({
  id: `related-${i}`, title: `Relacionado ${i + 1}`, description: '', type: 'MOVIE', genre: ['Ciencia Ficción'],
  year: 2023, duration: 120, rating: 4, posterUrl: `https://picsum.photos/seed/related-${i}/400/600`,
  bannerUrl: '', videoUrl: '', active: true, views: 0, createdAt: '',
}));

const ContentDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { myList, addToMyList, removeFromMyList } = useContentStore();
  const [userRating, setUserRating] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(mockComments);
  const content = mockDetail;
  const isInList = myList.some((c) => c.id === content.id);

  const sortedComments = [...comments].sort((a, b) => (b.positive ? 1 : 0) - (a.positive ? 1 : 0));

  const handleAddComment = () => {
    if (!commentText.trim() || !userRating) return;
    const newComment: UserComment = {
      id: `new-${Date.now()}`, userId: 'me', userName: 'Yo', contentId: content.id,
      text: commentText, rating: userRating, positive: userRating >= 4, createdAt: new Date().toISOString(),
    };
    setComments([newComment, ...comments]);
    setCommentText('');
    setUserRating(0);
  };

  return (
    <div className="-mt-16 min-h-screen">
      {/* Banner */}
      <div className="relative h-[60vh]">
        <img src={content.bannerUrl || content.posterUrl} alt="" className="h-full w-full object-cover" />
        <div className="hero-overlay absolute inset-0" />
        <button onClick={() => navigate(-1)} className="absolute left-4 top-20 z-10 flex items-center gap-2 text-foreground hover:text-primary">
          <ArrowLeft className="h-5 w-5" /> Volver
        </button>
      </div>

      <div className="relative z-10 -mt-32 mx-auto max-w-[1200px] px-4 md:px-8">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Poster */}
          <img src={content.posterUrl} alt={content.title} className="hidden h-[350px] w-[230px] rounded-lg object-cover shadow-2xl md:block" />

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-black text-foreground md:text-4xl">{content.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> {content.rating.toFixed(1)}</span>
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {content.year}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {content.duration} min</span>
              <span className="rounded-md bg-secondary px-2 py-0.5 text-xs">{content.type === 'MOVIE' ? 'Película' : 'Serie'}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {content.genre.map((g) => (
                <span key={g} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{g}</span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{content.description}</p>

            <div className="mt-6 flex items-center gap-3">
              <button onClick={() => navigate(`/watch/${content.id}`)}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-bold text-primary-foreground transition-all hover:scale-105">
                <Play className="h-5 w-5 fill-current" /> Reproducir
              </button>
              <button onClick={() => isInList ? removeFromMyList(content.id) : addToMyList(content)}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary">
                {isInList ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {isInList ? 'En Mi Lista' : 'Mi Lista'}
              </button>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="mt-12">
          <h2 className="mb-6 text-xl font-bold text-foreground">Comentarios y Valoraciones</h2>

          {/* Add comment */}
          <div className="mb-8 rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Tu valoración:</span>
              <StarRating rating={userRating} onChange={setUserRating} />
            </div>
            <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Escribe tu comentario..."
              className="w-full rounded-lg border border-border bg-secondary p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" rows={3} />
            <button onClick={handleAddComment}
              className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Publicar
            </button>
          </div>

          {/* Comments list */}
          <div className="space-y-4">
            {sortedComments.map((c) => (
              <div key={c.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-bold text-foreground">
                      {c.userName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-foreground">{c.userName}</span>
                  </div>
                  <StarRating rating={c.rating} readonly size="sm" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{c.text}</p>
                <span className="mt-2 block text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Related */}
        <div className="mt-12 pb-12">
          <ContentRow title="Contenido Similar" contents={related} />
        </div>
      </div>
    </div>
  );
};

export default ContentDetailPage;
