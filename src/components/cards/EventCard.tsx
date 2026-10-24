import React from 'react';
import { Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { CulturalEvent } from '../../types';
import { CulturalVisualPlaceholder } from '../common/CulturalVisualPlaceholder';

interface EventCardProps {
  event: CulturalEvent;
  onClick: () => void;
  variant?: 'rail' | 'list';
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onClick,
  variant = 'rail',
  className = ''
}) => {
  const startDate = new Date(event.start_datetime);
  const endDate = new Date(event.end_datetime);

  const formatShortDate = (d: Date) => {
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusText = () => {
    switch (event.event_status) {
      case 'ongoing': return 'Sedang Berlangsung';
      case 'completed': return 'Telah Selesai';
      case 'postponed': return 'Ditunda';
      case 'canceled': return 'Dibatalkan';
      case 'upcoming':
      default:
        return 'Mendatang';
    }
  };

  // Rail Variant (for Homepage horizontal discovery)
  if (variant === 'rail') {
    return (
      <article
        onClick={onClick}
        className={`group cursor-pointer flex flex-col shrink-0 select-none transition-transform active:scale-[0.98] ${className}`}
      >
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-900 shadow-md group-hover:shadow-xl transition-all duration-300">
          <CulturalVisualPlaceholder
            category="pagelaran"
            title={event.title}
            region={event.province}
            aspectRatio="16:9"
            imageUrl={event.poster_url}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

          {/* Prominent Date Badge */}
          <div className="absolute top-2.5 left-2.5 z-10 bg-[var(--color-maroon,#800020)] text-white px-2 py-1 rounded-xl shadow-md text-center min-w-[44px]">
            <span className="block text-[10px] uppercase font-semibold text-[var(--color-gold,#D4A373)] leading-none">
              {startDate.toLocaleDateString('id-ID', { month: 'short' })}
            </span>
            <span className="block text-base font-bold leading-tight tabular-nums mt-0.5">
              {startDate.getDate()}
            </span>
          </div>

          {/* Status Indicator */}
          <div className="absolute top-2.5 right-2.5 z-10 text-[10px] font-semibold text-white/90 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full">
            {getStatusText()}
          </div>

          {/* Location in bottom */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between text-[11px] text-[#D6CEBE]">
            <span className="flex items-center gap-1 truncate max-w-[70%]">
              <MapPin className="w-3 h-3 text-[var(--color-gold,#D4A373)] shrink-0" />
              <span className="truncate">{event.city}, {event.province}</span>
            </span>
            {event.verification_status === 'verified' && (
              <span className="flex items-center gap-0.5 text-emerald-400 font-medium shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                <span>Resmi</span>
              </span>
            )}
          </div>
        </div>

        {/* Unboxed Metadata (Zero-Pill) */}
        <div className="pt-2.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-muted-text,#6D675F)] font-medium">
            <span className="text-[var(--color-maroon,#800020)] font-semibold">{event.category}</span>
            <span aria-hidden="true" className="text-[var(--color-gold,#D4A373)]">·</span>
            <span>{event.organizer}</span>
          </div>
          <h3 className="font-serif font-bold text-sm sm:text-base text-[var(--color-charcoal,#292522)] group-hover:text-[var(--color-maroon,#800020)] transition-colors line-clamp-1 leading-snug">
            {event.title}
          </h3>
        </div>
      </article>
    );
  }

  // List Variant (for Pagelaran Page chronological list)
  return (
    <article
      onClick={onClick}
      className={`group cursor-pointer flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white border border-[var(--color-border-sand,#E5DED2)] hover:border-[var(--color-gold,#D4A373)] hover:shadow-md transition-all active:scale-[0.99] ${className}`}
    >
      <div className="relative sm:w-52 aspect-video rounded-xl overflow-hidden bg-stone-900 shrink-0">
        <CulturalVisualPlaceholder
          category="pagelaran"
          title={event.title}
          region={event.province}
          aspectRatio="16:9"
          imageUrl={event.poster_url}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

        {/* Date badge */}
        <div className="absolute top-2.5 left-2.5 bg-[var(--color-maroon,#800020)] text-white px-2 py-0.5 rounded-lg text-center shadow-md">
          <span className="block text-[9px] uppercase font-semibold text-[var(--color-gold,#D4A373)] leading-none">
            {startDate.toLocaleDateString('id-ID', { month: 'short' })}
          </span>
          <span className="block text-sm font-bold leading-tight tabular-nums">
            {startDate.getDate()}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between space-y-2">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-muted-text,#6D675F)] font-medium mb-1">
            <span className="text-[var(--color-maroon,#800020)] font-semibold">{event.category}</span>
            <span aria-hidden="true" className="text-[var(--color-gold,#D4A373)]">·</span>
            <span>{getStatusText()}</span>
            {event.verification_status === 'verified' && (
              <>
                <span aria-hidden="true" className="text-[var(--color-gold,#D4A373)]">·</span>
                <span className="text-emerald-700 flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Resmi
                </span>
              </>
            )}
          </div>

          <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--color-charcoal,#292522)] group-hover:text-[var(--color-maroon,#800020)] transition-colors leading-snug">
            {event.title}
          </h3>

          <p className="text-xs text-[var(--color-muted-text,#6D675F)] line-clamp-2 mt-1 leading-relaxed">
            {event.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-muted-text,#6D675F)] pt-2 border-t border-[var(--color-border-sand)]/60">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[var(--color-gold,#D4A373)]" />
            <span>{formatShortDate(startDate)} — {formatShortDate(endDate)}</span>
          </span>
          <span className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-[var(--color-gold,#D4A373)]" />
            <span>{event.venue}, {event.city}</span>
          </span>
        </div>
      </div>
    </article>
  );
};
