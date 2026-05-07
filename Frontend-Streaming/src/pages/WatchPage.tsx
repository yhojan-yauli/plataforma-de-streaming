import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Maximize, Volume2, VolumeX, Settings, SkipForward, Loader2 } from 'lucide-react';
import { contentService } from '@/services/contentService';
import type { Content, Episode } from '@/types';

const WatchPage: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideControlsTimeoutRef = useRef<number | null>(null);
  const lastSavedProgressRef = useRef(0);
  const [content, setContent] = useState<Content | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadPlayback = async () => {
      if (!id) return;

      setLoading(true);

      try {
        const contentResponse = await contentService.getById(id);
        if (cancelled) return;

        const contentData = contentResponse.data;
        setContent(contentData);

        if (contentData.type === 'SERIES') {
          const episodesResponse = await contentService.getEpisodes(id);
          if (cancelled) return;

          const availableEpisodes = episodesResponse.data;
          const requestedEpisodeId = searchParams.get('episodeId');
          const activeEpisode = availableEpisodes.find((episode) => episode.id === requestedEpisodeId) ?? availableEpisodes[0] ?? null;

          setEpisodes(availableEpisodes);
          setSelectedEpisode(activeEpisode);
        } else {
          setEpisodes([]);
          setSelectedEpisode(null);
        }

        lastSavedProgressRef.current = 0;
        setProgress(0);
        setError(null);
      } catch {
        if (cancelled) return;
        setError('No pudimos cargar la reproducción.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadPlayback();

    return () => {
      cancelled = true;
    };
  }, [id, searchParams]);

  useEffect(() => {
    if (!videoRef.current) return;

    if (playing) {
      void videoRef.current.play().catch(() => {
        setPlaying(false);
      });
    } else {
      videoRef.current.pause();
    }
  }, [playing, selectedEpisode?.id, content?.id]);

  useEffect(() => () => {
    if (hideControlsTimeoutRef.current) {
      window.clearTimeout(hideControlsTimeoutRef.current);
    }
  }, []);

  const showControlsTemporarily = () => {
    setShowControls(true);

    if (hideControlsTimeoutRef.current) {
      window.clearTimeout(hideControlsTimeoutRef.current);
    }

    hideControlsTimeoutRef.current = window.setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const saveProgress = async (nextProgress: number) => {
    if (!id || nextProgress <= 0) return;

    try {
      await contentService.updateProgress(id, {
        progress: nextProgress,
        episodeId: selectedEpisode?.id,
      });
    } catch {
      // Keep playback uninterrupted even if progress sync fails.
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    setPlaying((currentPlaying) => !currentPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || !Number.isFinite(videoRef.current.duration) || videoRef.current.duration === 0) {
      return;
    }

    const nextProgress = Math.min(
      100,
      Math.round((videoRef.current.currentTime / videoRef.current.duration) * 100),
    );

    setProgress(nextProgress);

    if (nextProgress === 100 || nextProgress - lastSavedProgressRef.current >= 10) {
      lastSavedProgressRef.current = nextProgress;
      void saveProgress(nextProgress);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center gap-3 bg-background text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Cargando reproducción...
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="flex h-screen items-center justify-center bg-background px-4 text-center text-muted-foreground">
        {error ?? 'No encontramos el contenido solicitado.'}
      </div>
    );
  }

  const mediaTitle = selectedEpisode
    ? `${content.title} · T${selectedEpisode.season}E${selectedEpisode.episode} · ${selectedEpisode.title}`
    : content.title;
  const videoUrl = selectedEpisode?.videoUrl || content.videoUrl;

  if (!videoUrl) {
    return (
      <div className="flex h-screen items-center justify-center bg-background px-4 text-center text-muted-foreground">
        Este contenido no está disponible para reproducción con tu acceso actual.
      </div>
    );
  }

  return (
    <div
      className="relative -mt-16 flex h-screen w-full items-center justify-center bg-background"
      onMouseMove={showControlsTemporarily}
    >
      <video
        ref={videoRef}
        key={selectedEpisode?.id || content.id}
        src={videoUrl}
        autoPlay={playing}
        muted={muted}
        className="absolute inset-0 h-full w-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
        onEnded={() => {
          setPlaying(false);
          setProgress(100);
          lastSavedProgressRef.current = 100;
          void saveProgress(100);
        }}
      />

      <div className={`absolute left-0 right-0 top-0 flex items-center gap-4 bg-gradient-to-b from-background/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-foreground hover:text-primary">
          <ArrowLeft className="h-6 w-6" />
          <span className="text-sm font-medium">Volver</span>
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-foreground">{mediaTitle}</h2>
          {episodes.length > 0 && (
            <p className="text-xs text-muted-foreground">{episodes.length} episodios disponibles</p>
          )}
        </div>
      </div>

      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-foreground hover:text-primary">
              {playing ? (
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
              ) : (
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" /></svg>
              )}
            </button>
            <button
              onClick={() => {
                if (!videoRef.current) return;
                videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, videoRef.current.duration || videoRef.current.currentTime);
              }}
              className="text-foreground hover:text-primary"
            >
              <SkipForward className="h-6 w-6" />
            </button>
            <button onClick={() => setMuted((currentMuted) => !currentMuted)} className="text-foreground hover:text-primary">
              {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </button>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-foreground hover:text-primary">
              <Settings className="h-5 w-5" />
            </button>
            <button onClick={() => document.documentElement.requestFullscreen?.()} className="text-foreground hover:text-primary">
              <Maximize className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
