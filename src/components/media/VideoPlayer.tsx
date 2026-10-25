import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  AlertCircle,
  ExternalLink,
  Film
} from 'lucide-react';

interface VideoPlayerProps {
  title: string;
  mediaUrl?: string;
  driveFileId?: string;
  posterUrl?: string;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  title,
  mediaUrl,
  driveFileId,
  posterUrl,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useDriveIframe, setUseDriveIframe] = useState(false);

  // If Google Drive link is provided and no direct streaming URL
  useEffect(() => {
    if (!mediaUrl && driveFileId) {
      setUseDriveIframe(true);
    }
  }, [mediaUrl, driveFileId]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((err) => {
        setPlaybackError('Pemutaran video tidak diizinkan atau format tidak didukung');
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetVol = parseFloat(e.target.value);
    setVolume(targetVol);
    if (videoRef.current) {
      videoRef.current.volume = targetVol;
      setIsMuted(targetVol === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // YouTube URLs must use the provider embed player, not an HTML5 <video> source.
  const youtubeMatch = String(mediaUrl || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/i);
  if (youtubeMatch && youtubeMatch[1]) {
    return (
      <div className={`relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-[#E5DED2] shadow-lg ${className}`}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeMatch[1]}`}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  // Google Drive Embedded Previewer
  if (useDriveIframe && driveFileId) {
    const drivePreviewUrl = `https://drive.google.com/file/d/${driveFileId}/preview`;
    return (
      <div className={`relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-[#E5DED2] shadow-lg ${className}`}>
        <iframe
          src={drivePreviewUrl}
          title={title}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] text-[#D4A373] flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5" />
          <span>Pratinjau Google Drive</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-[#E5DED2] group shadow-lg ${className}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={mediaUrl}
        poster={posterUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          setIsLoading(false);
          setPlaybackError('Media video tidak dapat dimuat langsung dari sumber URL.');
        }}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
      />

      {/* Loading Overlay */}
      {isLoading && !playbackError && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 border-2 border-[#D4A373] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Playback Error Feedback */}
      {playbackError && (
        <div className="absolute inset-0 bg-black/85 p-6 flex flex-col items-center justify-center text-center text-white">
          <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
          <p className="text-sm font-semibold max-w-md mb-2">{playbackError}</p>
          <p className="text-xs text-white/70 max-w-sm mb-4">
            File Google Drive memerlukan izin akses publik atau format berkas video yang kompatibel dengan browser.
          </p>
          {driveFileId && (
            <button
              onClick={() => setUseDriveIframe(true)}
              className="px-4 py-2 text-xs font-medium bg-[#800020] text-white rounded-lg hover:bg-[#590018] transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Coba Pemutar Google Drive Iframe
            </button>
          )}
        </div>
      )}

      {/* Custom Video Controls Bar */}
      {!playbackError && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-95 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
          {/* Scrubber Seek Bar */}
          <div className="relative w-full flex items-center">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#800020] hover:h-2 transition-all"
            />
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-[#800020] hover:bg-[#9B1135] text-white flex items-center justify-center transition-colors"
                aria-label={isPlaying ? 'Jeda' : 'Putar'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>

              <div className="flex items-center gap-1.5 text-white/90 font-mono text-[11px] tabular-nums">
                <span>{formatTime(currentTime)}</span>
                <span className="text-white/40">/</span>
                <span>{formatTime(duration)}</span>
              </div>

              {/* Volume */}
              <div className="hidden sm:flex items-center gap-1.5 ml-2">
                <button onClick={toggleMute} className="text-white/80 hover:text-white" aria-label="Volume">
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#D4A373]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Playback Speed */}
              <div className="flex items-center gap-1">
                {[1, 1.25, 1.5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => changeSpeed(speed)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                      playbackSpeed === speed
                        ? 'bg-[#D4A373] text-[#292522] font-semibold'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white/80 hover:text-white p-1"
                aria-label={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
