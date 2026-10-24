import React from 'react';
import { Play, Headphones, Clock, Users, Sparkles, Disc } from 'lucide-react';
import { ContentItem } from '../../types';
import { CulturalVisualPlaceholder } from '../common/CulturalVisualPlaceholder';

export type ContentCardVariant = 'landscape' | 'portrait' | 'audio' | 'tutorial';

interface ContentCardProps {
  item: ContentItem;
  onClick: () => void;
  onPlayAudio?: (item: ContentItem) => void;
  variant?: ContentCardVariant;
  className?: string;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  onClick,
  onPlayAudio,
  variant = 'landscape',
  className = ''
}) => {
  const formatDuration = (seconds: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} mnt ${secs > 0 ? `${secs} dtk` : ''}`;
  };

  const isAudio = item.content_type === 'audio' || item.category_id === 'gema-swara';
  const isGame = item.category_id === 'gelanggang';

  // Handle direct audio play click
  const handleActionClick = (e: React.MouseEvent) => {
    if (isAudio && onPlayAudio) {
      e.stopPropagation();
      onPlayAudio(item);
    } else {
      onClick();
    }
  };

  // 1. AUDIO VARIANT (Vinyl/Streaming Music App Disc Aesthetic)
  if (variant === 'audio' || (isAudio && variant !== 'portrait')) {
    return (
      <article
        onClick={onClick}
        className={`group cursor-pointer flex flex-col shrink-0 select-none transition-transform active:scale-[0.98] ${className}`}
      >
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-900 shadow-md group-hover:shadow-xl transition-all duration-300">
          <CulturalVisualPlaceholder
            category="gema-swara"
            title={item.title}
            region={item.origin_province}
            aspectRatio="1:1"
            imageUrl={item.cover_url}
          />

          {/* Vinyl groove subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Audio badge */}
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-medium text-[var(--color-gold,#D4A373)]">
            <Disc className="w-3 h-3 text-[var(--color-gold,#D4A373)]" />
            <span>{item.subcategory_name || 'Gema Swara'}</span>
          </div>

          {/* Quick Play Floating Action Button */}
          <button
            type="button"
            onClick={handleActionClick}
            className="absolute bottom-3 right-3 z-20 w-10 h-10 rounded-full bg-[var(--color-maroon,#800020)] hover:bg-[var(--color-maroon-deep,#590018)] text-white shadow-xl flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 active:scale-95"
            aria-label={`Putar audio ${item.title}`}
          >
            <Play className="w-4 h-4 ml-0.5 fill-white" />
          </button>

          {/* Duration in bottom-left */}
          {item.duration_seconds > 0 && (
            <div className="absolute bottom-3 left-3 z-10 text-[10px] font-mono text-[#D6CEBE]">
              {formatDuration(item.duration_seconds)}
            </div>
          )}
        </div>

        {/* Unboxed Metadata (Zero-Pill) */}
        <div className="pt-2.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-muted-text,#6D675F)] font-medium">
            <span>{item.origin_province}</span>
            {item.episode_number && (
              <>
                <span aria-hidden="true" className="text-[var(--color-gold,#D4A373)]">·</span>
                <span className="tabular-nums">Eps. {item.episode_number}</span>
              </>
            )}
          </div>
          <h3 className="font-serif font-bold text-sm text-[var(--color-charcoal,#292522)] group-hover:text-[var(--color-maroon,#800020)] transition-colors line-clamp-2 leading-snug">
            {item.title}
          </h3>
        </div>
      </article>
    );
  }

  // 2. PORTRAIT VARIANT (Cinematic Poster)
  if (variant === 'portrait') {
    return (
      <article
        onClick={onClick}
        className={`group cursor-pointer flex flex-col shrink-0 select-none transition-transform active:scale-[0.98] ${className}`}
      >
        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-stone-900 shadow-md group-hover:shadow-xl transition-all duration-300">
          <CulturalVisualPlaceholder
            category={item.category_id}
            title={item.title}
            region={item.origin_province}
            aspectRatio="2:3"
            imageUrl={item.cover_url}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

          {/* Region kicker */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-[var(--color-gold,#D4A373)]">
              {item.origin_province}
            </span>
          </div>

          {/* Bottom Title overlay */}
          <div className="absolute bottom-3 left-3 right-3 z-10 space-y-1">
            <span className="text-[10px] text-[#D6CEBE] font-medium block">
              {item.subcategory_name || item.category_id}
            </span>
            <h3 className="font-serif font-bold text-sm sm:text-base text-white line-clamp-2 leading-snug">
              {item.title}
            </h3>
          </div>
        </div>
      </article>
    );
  }

  // 3. TUTORIAL VARIANT (Traditional Games)
  if (variant === 'tutorial' || isGame) {
    return (
      <article
        onClick={onClick}
        className={`group cursor-pointer flex flex-col shrink-0 select-none transition-transform active:scale-[0.98] ${className}`}
      >
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-900 shadow-md group-hover:shadow-xl transition-all duration-300">
          <CulturalVisualPlaceholder
            category="gelanggang"
            title={item.title}
            region={item.origin_province}
            aspectRatio="16:9"
            imageUrl={item.cover_url}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

          {/* Play/Tutorial Icon indicator */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-11 h-11 rounded-full bg-[var(--color-terracotta,#C65D3A)] text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 ml-0.5 fill-white" />
            </div>
          </div>

          {/* Tutorial badge in corner */}
          <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 text-[10px] text-white/90">
            {item.tutorial_data?.players_count && (
              <span className="flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full">
                <Users className="w-3 h-3 text-[var(--color-gold,#D4A373)]" />
                <span>{item.tutorial_data.players_count}</span>
              </span>
            )}
          </div>
        </div>

        {/* Unboxed Metadata (Zero-Pill) */}
        <div className="pt-2.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-muted-text,#6D675F)] font-medium">
            <span className="text-[var(--color-terracotta,#C65D3A)] font-semibold">{item.subcategory_name || 'Permainan Rakyat'}</span>
            <span aria-hidden="true" className="text-[var(--color-gold,#D4A373)]">·</span>
            <span>{item.origin_province}</span>
          </div>
          <h3 className="font-serif font-bold text-sm sm:text-base text-[var(--color-charcoal,#292522)] group-hover:text-[var(--color-maroon,#800020)] transition-colors line-clamp-1 leading-snug">
            {item.title}
          </h3>
          <p className="text-xs text-[var(--color-muted-text,#6D675F)] line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>
      </article>
    );
  }

  // 4. DEFAULT: CINEMATIC LANDSCAPE VARIANT (16:9 for Films & Stories)
  return (
    <article
      onClick={onClick}
      className={`group cursor-pointer flex flex-col shrink-0 select-none transition-transform active:scale-[0.98] ${className}`}
    >
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-900 shadow-md group-hover:shadow-xl transition-all duration-300">
        <CulturalVisualPlaceholder
          category={item.category_id}
          title={item.title}
          region={item.origin_province}
          aspectRatio="16:9"
          imageUrl={item.cover_url}
        />

        {/* Ambient shadow gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Play button hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-11 h-11 rounded-full bg-[var(--color-maroon,#800020)] text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 ml-0.5 fill-white" />
          </div>
        </div>

        {/* Duration ribbon */}
        {item.duration_seconds > 0 && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-full text-[10px] text-white/90 font-mono tabular-nums flex items-center gap-1">
            <Clock className="w-3 h-3 text-[var(--color-gold,#D4A373)]" />
            <span>{formatDuration(item.duration_seconds)}</span>
          </div>
        )}

        {/* Province kicker */}
        <div className="absolute top-2.5 left-2.5">
          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-[var(--color-gold,#D4A373)]">
            {item.origin_province}
          </span>
        </div>
      </div>

      {/* Unboxed Metadata (Zero-Pill) */}
      <div className="pt-2.5 space-y-1">
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-muted-text,#6D675F)] font-medium">
          <span className="text-[var(--color-maroon,#800020)] font-semibold">
            {item.subcategory_name || (item.category_id === 'lalakon' ? 'Lalakon' : item.category_id)}
          </span>
          <span aria-hidden="true" className="text-[var(--color-gold,#D4A373)]">·</span>
          <span>{item.origin_province}</span>
        </div>
        <h3 className="font-serif font-bold text-sm sm:text-base text-[var(--color-charcoal,#292522)] group-hover:text-[var(--color-maroon,#800020)] transition-colors line-clamp-1 leading-snug">
          {item.title}
        </h3>
        <p className="text-xs text-[var(--color-muted-text,#6D675F)] line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      </div>
    </article>
  );
};
