import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface ContentRailProps {
  title: string;
  subtitle?: string;
  kicker?: string;
  onViewAll?: () => void;
  viewAllLabel?: string;
  children: React.ReactNode;
  className?: string;
}

export const ContentRail: React.FC<ContentRailProps> = ({
  title,
  subtitle,
  kicker,
  onViewAll,
  viewAllLabel = 'Lihat Semua',
  children,
  className = ''
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -320 : 320;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className={`space-y-3 ${className}`}>
      {/* Rail Header */}
      <div className="px-4 sm:px-6 lg:px-8 flex items-end justify-between gap-4">
        <div>
          {kicker && (
            <div className="text-[11px] font-semibold text-[var(--color-maroon,#800020)] uppercase tracking-wider mb-0.5">
              {kicker}
            </div>
          )}
          <h2 className="font-serif font-bold text-lg sm:text-xl md:text-2xl text-[var(--color-charcoal,#292522)] tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-[var(--color-muted-text,#6D675F)] line-clamp-1 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* View All & Desktop Navigation Arrows */}
        <div className="flex items-center gap-2 shrink-0">
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs font-semibold text-[var(--color-maroon,#800020)] hover:text-[var(--color-maroon-deep,#590018)] flex items-center gap-1 transition-colors py-1 cursor-pointer"
            >
              <span>{viewAllLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Desktop Left/Right Controls */}
          <div className="hidden md:flex items-center gap-1 ml-2">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[var(--color-charcoal,#292522)] border border-[var(--color-border-sand,#E5DED2)] shadow-xs flex items-center justify-center transition cursor-pointer"
              aria-label="Gulir ke kiri"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[var(--color-charcoal,#292522)] border border-[var(--color-border-sand,#E5DED2)] shadow-xs flex items-center justify-center transition cursor-pointer"
              aria-label="Gulir ke kanan"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Touch-Friendly Horizontal Rail Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto touch-pan-x no-scrollbar px-4 sm:px-6 lg:px-8 py-1 snap-x snap-mandatory scroll-pl-4"
      >
        {children}
      </div>
    </section>
  );
};
