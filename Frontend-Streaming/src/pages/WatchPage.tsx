import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Maximize, Volume2, VolumeX, Settings, SkipForward } from 'lucide-react';

const WatchPage: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) videoRef.current.pause();
    else videoRef.current.play();
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
  };

  return (
    <div
      className="relative -mt-16 flex h-screen w-full items-center justify-center bg-background"
      onMouseMove={() => {
        setShowControls(true);
        setTimeout(() => setShowControls(false), 3000);
      }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay={playing}
        muted={muted}
        className="absolute inset-0 h-full w-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
      />

      {/* Top controls */}
      <div className={`absolute left-0 right-0 top-0 flex items-center gap-4 bg-gradient-to-b from-background/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-foreground hover:text-primary">
          <ArrowLeft className="h-6 w-6" />
          <span className="text-sm font-medium">Volver</span>
        </button>
        <h2 className="text-lg font-bold text-foreground">Reproduciendo</h2>
      </div>

      {/* Bottom controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="mb-4 h-1 w-full cursor-pointer overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-foreground hover:text-primary">
              {playing ? (
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              ) : (
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
              )}
            </button>
            <button className="text-foreground hover:text-primary"><SkipForward className="h-6 w-6" /></button>
            <button onClick={() => setMuted(!muted)} className="text-foreground hover:text-primary">
              {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </button>
            <span className="text-sm text-muted-foreground">{Math.floor(progress)}%</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-foreground hover:text-primary"><Settings className="h-5 w-5" /></button>
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
