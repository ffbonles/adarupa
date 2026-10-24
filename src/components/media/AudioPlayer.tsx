import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  ListMusic,
  X,
  ChevronDown,
  ChevronUp,
  Headphones,
  AlertCircle,
  FileText,
  Disc,
  Sparkles
} from 'lucide-react';
import { ContentItem } from '../../types';

export interface AudioTrackInfo {
  content: ContentItem;
  episodeList?: ContentItem[];
  onSelectEpisode?: (item: ContentItem) => void;
}

interface AudioPlayerProps {
  currentTrack: AudioTrackInfo | null;
  onClose: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentTrack,
  onClose
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const content = currentTrack?.content;

  useEffect(() => {
    if (content) {
      setAudioError(null);
      setCurrentTime(0);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      }
    }
  }, [content?.content_id]);

  if (!content) return null;

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
        setAudioError('Gagal memutar audio. Periksa koneksi.');
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || content.duration_seconds || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const skipSeconds = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.min(Math.max(audioRef.current.currentTime + seconds, 0), duration || content.duration_seconds || 100);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const episodes = currentTrack.episodeList || [];
  const currentIndex = episodes.findIndex((e) => e.content_id === content.content_id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < episodes.length - 1;

  const playPrev = () => {
    if (hasPrev && currentTrack.onSelectEpisode) {
      currentTrack.onSelectEpisode(episodes[currentIndex - 1]);
    }
  };

  const playNext = () => {
    if (hasNext && currentTrack.onSelectEpisode) {
      currentTrack.onSelectEpisode(episodes[currentIndex + 1]);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <audio
        ref={audioRef}
        src={content.media_url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          if (hasNext) playNext();
        }}
        onError={() => setAudioError('Sumber berkas audio tidak dapat diakses')}
      />

      {/* =========================================================================
          1. STREAMING PERSISTENT MINI-PLAYER (DOCKED ABOVE BOTTOM NAV ON MOBILE)
          ========================================================================= */}
      <aside
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-[58px] md:bottom-4 left-2 right-2 md:left-4 md:right-4 max-w-2xl mx-auto z-40 bg-gradient-to-r from-[#590018] via-[#800020] to-[#1B3A2F] text-white rounded-2xl shadow-2xl border border-[var(--color-gold,#D4A373)]/30 backdrop-blur-xl overflow-hidden cursor-pointer select-none transition-all active:scale-[0.99]"
        aria-label="Pemutar Audio Nusantara"
      >
        {/* Progress line at top edge */}
        <div className="w-full h-1 bg-black/40">
          <div
            className="h-full bg-[var(--color-gold,#D4A373)] transition-all duration-200"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>

        <div className="p-2.5 sm:p-3 flex items-center justify-between gap-3">
          {/* Track info & Disc Artwork */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-10 h-10 rounded-xl bg-black/40 border border-[var(--color-gold,#D4A373)]/40 overflow-hidden shrink-0 flex items-center justify-center">
              {content.cover_url ? (
                <img
                  src={content.cover_url}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Disc
                  className={`w-5 h-5 text-[var(--color-gold,#D4A373)] ${
                    isPlaying ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '6s' }}
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold truncate text-white leading-tight">
                {content.title}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#D6CEBE] truncate mt-0.5">
                <span>{content.series_title || content.subcategory_name || 'Gema Swara'}</span>
                <span>·</span>
                <span>{content.origin_province}</span>
                {content.episode_number && (
                  <>
                    <span>·</span>
                    <span>Bagian {content.episode_number}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Controls: Play/Pause, Expand, Close */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {audioError && (
              <span className="text-[10px] text-rose-300 flex items-center gap-1 mr-1">
                <AlertCircle className="w-3 h-3" />
                <span className="hidden sm:inline">Error</span>
              </span>
            )}

            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-white text-[var(--color-maroon,#800020)] hover:bg-[#F8F3E9] shadow-md flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
              aria-label={isPlaying ? 'Jeda Audio' : 'Putar Audio'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-[var(--color-maroon,#800020)]" />
              ) : (
                <Play className="w-4 h-4 ml-0.5 fill-[var(--color-maroon,#800020)]" />
              )}
            </button>

            {/* Expand Full Player Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
              }}
              className="p-1.5 text-white/70 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Perluas Layar Penuh"
            >
              <ChevronUp className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1.5 text-white/70 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Tutup Pemutar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          2. IMMERSIVE FULL-SCREEN / EXPANDED AUDIO PLAYER SHEET (NATIVE APP FEEL)
          ========================================================================= */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-10 animate-fade-in text-white overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-4">
            <button
              onClick={() => setIsExpanded(false)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#D4A373] hover:text-white transition-colors cursor-pointer"
            >
              <ChevronDown className="w-5 h-5" />
              <span>Kecilkan Pemutar</span>
            </button>

            <span className="text-xs uppercase tracking-wider font-semibold text-[#D6CEBE]">
              {content.subcategory_name || 'Gema Swara Nusantara'}
            </span>

            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Visual & Track Information Area */}
          <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center items-center text-center py-6 space-y-6">
            {/* Large Album Art with Disc Aesthetic */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden bg-stone-900 border-2 border-[var(--color-gold,#D4A373)]/40 shadow-2xl">
              {content.cover_url ? (
                <img
                  src={content.cover_url}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#590018] via-[#800020] to-[#122820] p-6 text-center">
                  <div className={`w-20 h-20 rounded-full border-4 border-[var(--color-gold,#D4A373)]/60 flex items-center justify-center mb-3 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }}>
                    <Disc className="w-10 h-10 text-[var(--color-gold,#D4A373)]" />
                  </div>
                  <span className="text-xs text-[var(--color-gold,#D4A373)] font-semibold uppercase tracking-wider">
                    {content.origin_province}
                  </span>
                </div>
              )}
            </div>

            {/* Title & Metadata */}
            <div className="space-y-1.5">
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-white tracking-tight">
                {content.title}
              </h2>
              <div className="flex items-center justify-center gap-2 text-xs text-[#D6CEBE]">
                <span>{content.series_title || content.origin_province}</span>
                {content.episode_number && (
                  <>
                    <span aria-hidden="true" className="text-[var(--color-gold,#D4A373)]">·</span>
                    <span>Bagian {content.episode_number}</span>
                  </>
                )}
              </div>
              {content.credits?.director_or_teller && (
                <p className="text-[11px] text-[#A89F91]">
                  Penutur: {content.credits.director_or_teller}
                </p>
              )}
            </div>

            {/* Scrubber Progress Bar */}
            <div className="w-full space-y-2 pt-2">
              <input
                type="range"
                min="0"
                max={duration || content.duration_seconds || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[var(--color-gold,#D4A373)]"
              />
              <div className="flex justify-between text-xs font-mono text-white/70">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration || content.duration_seconds || 0)}</span>
              </div>
            </div>

            {/* Playback Controls Row */}
            <div className="flex items-center justify-center gap-5 sm:gap-7 pt-2">
              <button
                type="button"
                disabled={!hasPrev}
                onClick={playPrev}
                className="p-2 text-white/70 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition"
                title="Episode Sebelumnya"
              >
                <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <button
                type="button"
                onClick={() => skipSeconds(-10)}
                className="p-2 text-white/70 hover:text-white cursor-pointer transition"
                title="Mundur 10 detik"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-white text-[var(--color-maroon,#800020)] hover:bg-[#F8F3E9] shadow-2xl flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-[var(--color-maroon,#800020)]" />
                ) : (
                  <Play className="w-7 h-7 ml-1 fill-[var(--color-maroon,#800020)]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => skipSeconds(10)}
                className="p-2 text-white/70 hover:text-white cursor-pointer transition"
                title="Maju 10 detik"
              >
                <RotateCw className="w-5 h-5" />
              </button>

              <button
                type="button"
                disabled={!hasNext}
                onClick={playNext}
                className="p-2 text-white/70 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition"
                title="Episode Berikutnya"
              >
                <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Secondary Controls: Speed & Episode Drawer Toggle */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              {/* Playback speed selector */}
              <div className="flex items-center gap-1 p-1 bg-white/10 rounded-xl text-xs font-semibold">
                {[0.75, 1, 1.25, 1.5].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => changeSpeed(spd)}
                    className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                      playbackSpeed === spd
                        ? 'bg-[var(--color-gold,#D4A373)] text-stone-900 shadow-xs'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Episodes Drawer Toggle */}
              {episodes.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowEpisodeDrawer(!showEpisodeDrawer)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-[var(--color-gold,#D4A373)] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ListMusic className="w-4 h-4" />
                  <span>Daftar Babak ({episodes.length})</span>
                </button>
              )}

              {/* Transcript toggle */}
              {content.audio_transcript && (
                <button
                  type="button"
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-[var(--color-gold,#D4A373)] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Transkrip Cerita</span>
                </button>
              )}
            </div>

            {/* Episode Drawer Modal within Player */}
            {showEpisodeDrawer && (
              <div className="w-full p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-left space-y-2 mt-4 max-h-48 overflow-y-auto">
                <p className="text-xs font-bold text-[var(--color-gold,#D4A373)] uppercase tracking-wider mb-2">
                  Daftar Episode Seri
                </p>
                {episodes.map((ep, idx) => (
                  <button
                    key={ep.content_id}
                    onClick={() => {
                      if (currentTrack.onSelectEpisode) currentTrack.onSelectEpisode(ep);
                      setShowEpisodeDrawer(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs transition flex items-center justify-between cursor-pointer ${
                      ep.content_id === content.content_id
                        ? 'bg-[var(--color-maroon,#800020)] text-white font-semibold'
                        : 'hover:bg-white/10 text-white/80'
                    }`}
                  >
                    <span className="truncate">
                      {idx + 1}. {ep.title}
                    </span>
                    <span className="text-[10px] text-[var(--color-gold,#D4A373)] font-mono ml-2 shrink-0">
                      {formatTime(ep.duration_seconds)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Transcript Drawer within Player */}
            {showTranscript && content.audio_transcript && (
              <div className="w-full p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-left space-y-2 mt-4 max-h-48 overflow-y-auto">
                <p className="text-xs font-bold text-[var(--color-gold,#D4A373)] uppercase tracking-wider mb-2">
                  Naskah Tutur Cerita
                </p>
                <p className="text-xs text-white/90 leading-relaxed font-sans">
                  {content.audio_transcript}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
