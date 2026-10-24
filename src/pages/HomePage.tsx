import React, { useState, useEffect } from 'react';
import {
  Film,
  Headphones,
  Gamepad2,
  Calendar,
  Play,
  ArrowRight,
  Compass,
  Sparkles,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { ContentCard } from '../components/cards/ContentCard';
import { EventCard } from '../components/cards/EventCard';
import { ContentRail } from '../components/common/ContentRail';
import { ContentItem, CulturalEvent, MainCategorySlug } from '../types';
import { api } from '../services/apiClient';
import { useSiteConfig } from '../services/SiteConfigContext';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onSelectContent: (slug: string) => void;
  onSelectEvent: (slug: string) => void;
  onPlayAudioTrack?: (item: ContentItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectContent,
  onSelectEvent,
  onPlayAudioTrack
}) => {
  const { config } = useSiteConfig();
  const hero = config.hero;
  const sections = config.sections;

  const [featuredContent, setFeaturedContent] = useState<ContentItem[]>([]);
  const [allStories, setAllStories] = useState<ContentItem[]>([]);
  const [audioItems, setAudioItems] = useState<ContentItem[]>([]);
  const [gameItems, setGameItems] = useState<ContentItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CulturalEvent[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      setIsLoading(true);
      try {
        const [featRes, allContentRes, eventRes] = await Promise.all([
          api.getFeaturedContent(),
          api.getContentList({ status: 'published', limit: 25 }),
          api.getEvents({ status: 'upcoming' })
        ]);

        setFeaturedContent(featRes.data || []);
        const all = allContentRes.data || [];
        setAllStories(all.filter((c) => c.category_id === 'lalakon'));
        setAudioItems(all.filter((c) => c.category_id === 'gema-swara'));
        setGameItems(all.filter((c) => c.category_id === 'gelanggang'));
        setUpcomingEvents(eventRes.data || []);
      } catch (err) {
        console.error('Gagal memuat beranda:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const leadHeroItem = featuredContent.length > 0 ? featuredContent[0] : null;

  const getCategoryIcon = (slug: MainCategorySlug) => {
    switch (slug) {
      case 'lalakon': return Film;
      case 'gema-swara': return Headphones;
      case 'gelanggang': return Gamepad2;
      case 'pagelaran': return Calendar;
      default: return Film;
    }
  };

  const sortedCategories = [...config.categories].sort((a, b) => a.displayOrder - b.displayOrder);

  const regionTabs = [
    { label: 'Semua Wilayah', value: 'all' },
    { label: 'Jawa & Sunda', value: 'Jawa Barat' },
    { label: 'Jawa Tengah & DIY', value: 'Jawa Tengah' },
    { label: 'Sumatera', value: 'Sumatera' },
    { label: 'Bali & NTT', value: 'Nusa Tenggara' },
    { label: 'Sulawesi & Maluku', value: 'Sulawesi' }
  ];

  const filteredRegionalStories = selectedRegion === 'all'
    ? allStories
    : allStories.filter((c) => c.origin_province.toLowerCase().includes(selectedRegion.toLowerCase()));

  return (
    <div className="space-y-8 sm:space-y-12 pb-32">
      {/* =========================================================================
          1. IMMERSIVE HERO BANNER (STREAMING APP CINEMATIC HERO)
          ========================================================================= */}
      <section className="relative overflow-hidden bg-[#141210] text-white">
        {/* Cinematic Backdrop Image */}
        <div className="absolute inset-0 z-0">
          {leadHeroItem?.cover_url || hero.bannerImageUrl ? (
            <img
              src={leadHeroItem?.cover_url || hero.bannerImageUrl}
              alt={leadHeroItem?.title || hero.mainHeadline}
              className="w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#590018] via-[#800020] to-[#122820] opacity-80" />
          )}

          {/* Gradients for text contrast & bottom fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ivory,#F8F3E9)] via-[#141210]/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141210]/90 via-[#141210]/40 to-transparent" />

          {/* Subtle cultural batik linework */}
          {config.theme.enableBatikPatterns && (
            <div className="absolute inset-0 batik-pattern opacity-10 pointer-events-none" />
          )}
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:py-20 flex flex-col justify-end min-h-[55vh] sm:min-h-[65vh]">
          <div className="max-w-2xl space-y-3 sm:space-y-4">
            {/* Kicker badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-[var(--color-gold,#D4A373)] text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-gold,#D4A373)]" />
              <span>{hero.kickerBadge}</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif font-bold text-2xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.15] text-white text-balance drop-shadow-md">
              {leadHeroItem ? leadHeroItem.title : hero.mainHeadline}
            </h1>

            {/* Synopsis */}
            <p className="text-xs sm:text-sm text-[#D6CEBE] max-w-xl leading-relaxed line-clamp-3 drop-shadow-xs font-sans">
              {leadHeroItem ? leadHeroItem.description : hero.supportingDescription}
            </p>

            {/* Call To Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={() => {
                  if (leadHeroItem) onSelectContent(leadHeroItem.slug);
                  else onNavigate(hero.primaryCtaLink || '/lalakon');
                }}
                className="px-5 py-2.5 rounded-full bg-[var(--color-maroon,#800020)] hover:bg-[var(--color-maroon-deep,#590018)] text-white font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{leadHeroItem ? 'Mulai Menonton' : hero.primaryCtaLabel}</span>
              </button>

              <button
                onClick={() => onNavigate(hero.secondaryCtaLink || '/pagelaran')}
                className="px-5 py-2.5 rounded-full bg-black/40 hover:bg-black/60 text-[var(--color-gold,#D4A373)] border border-[var(--color-gold,#D4A373)]/40 backdrop-blur-md font-semibold text-xs sm:text-sm transition-all cursor-pointer"
              >
                {hero.secondaryCtaLabel}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. COMPACT CATEGORY SHORTCUT RAIL (NATIVE MOBILE ENTERTAINMENT FEEL)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="flex gap-2.5 overflow-x-auto touch-pan-x no-scrollbar pb-1">
          {sortedCategories.map((cat) => {
            const Icon = getCategoryIcon(cat.slug);
            return (
              <button
                key={cat.slug}
                onClick={() => onNavigate(`/${cat.slug}`)}
                className="group flex-1 min-w-[130px] sm:min-w-[160px] p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-[var(--color-border-sand,#E5DED2)] hover:border-[var(--color-maroon,#800020)] shadow-xs hover:shadow-md transition-all active:scale-95 flex items-center gap-2.5 text-left cursor-pointer shrink-0"
              >
                <div className="w-9 h-9 rounded-xl bg-[var(--color-maroon,#800020)]/10 text-[var(--color-maroon,#800020)] group-hover:bg-[var(--color-maroon,#800020)] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block font-serif font-bold text-xs sm:text-sm text-[var(--color-charcoal,#292522)] truncate">
                    {cat.displayName}
                  </span>
                  <span className="block text-[10px] text-[var(--color-muted-text,#6D675F)] truncate">
                    {cat.badgeLabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          3. RAIL 1: KARYA UNGGULAN & FILM LALAKON (CINEMATIC 16:9 CARDS)
          ========================================================================= */}
      {allStories.length > 0 && (
        <ContentRail
          title={sections.lalakonSectionTitle || 'Kisah & Tutur Visual Nusantara'}
          kicker={sections.lalakonSectionKicker || 'Lalakon'}
          onViewAll={() => onNavigate('/lalakon')}
          viewAllLabel={sections.lalakonViewAllLabel || 'Lihat Semua'}
        >
          {allStories.map((item) => (
            <div key={item.content_id} className="w-64 sm:w-72 shrink-0 snap-start">
              <ContentCard
                item={item}
                onClick={() => onSelectContent(item.slug)}
                variant="landscape"
              />
            </div>
          ))}
        </ContentRail>
      )}

      {/* =========================================================================
          4. RAIL 2: DENGARKAN DI GEMA SWARA (SQUARE VINYL/AUDIO CARDS WITH 1-TAP PLAY)
          ========================================================================= */}
      {audioItems.length > 0 && (
        <ContentRail
          title={sections.gemaSwaraSectionTitle || 'Dengarkan Sekarang'}
          subtitle={sections.gemaSwaraSectionSubtitle || 'Sandiwara radio legendaris, dongeng pengantar tidur, dan kidung dawai tradisi.'}
          kicker={sections.gemaSwaraSectionKicker || 'Gema Swara'}
          onViewAll={() => onNavigate('/gema-swara')}
          viewAllLabel={sections.gemaSwaraViewAllLabel || 'Jelajahi Audio'}
        >
          {audioItems.map((item) => (
            <div key={item.content_id} className="w-48 sm:w-56 shrink-0 snap-start">
              <ContentCard
                item={item}
                onClick={() => onSelectContent(item.slug)}
                onPlayAudio={(track) => onPlayAudioTrack && onPlayAudioTrack(track)}
                variant="audio"
              />
            </div>
          ))}
        </ContentRail>
      )}

      {/* =========================================================================
          5. RAIL 3: PERMAINAN TRADISIONAL GELANGGANG (TUTORIAL CARDS)
          ========================================================================= */}
      {gameItems.length > 0 && (
        <ContentRail
          title={sections.gelanggangSectionTitle || 'Jelajahi Permainan Tradisional'}
          kicker={sections.gelanggangSectionKicker || 'Gelanggang'}
          onViewAll={() => onNavigate('/gelanggang')}
          viewAllLabel={sections.gelanggangViewAllLabel || 'Semua Tutorial'}
        >
          {gameItems.map((item) => (
            <div key={item.content_id} className="w-64 sm:w-72 shrink-0 snap-start">
              <ContentCard
                item={item}
                onClick={() => onSelectContent(item.slug)}
                variant="tutorial"
              />
            </div>
          ))}
        </ContentRail>
      )}

      {/* =========================================================================
          6. RAIL 4: PAGELARAN & FESTIVAL MENDATANG (EVENT CARDS WITH DATE RIBBONS)
          ========================================================================= */}
      {upcomingEvents.length > 0 && (
        <ContentRail
          title={sections.pagelaranSectionTitle || 'Agenda Festival & Perhelatan Adat'}
          kicker={sections.pagelaranSectionKicker || 'Pagelaran'}
          onViewAll={() => onNavigate('/pagelaran')}
          viewAllLabel={sections.pagelaranViewAllLabel || 'Kalender Lengkap'}
        >
          {upcomingEvents.map((ev) => (
            <div key={ev.event_id} className="w-64 sm:w-72 shrink-0 snap-start">
              <EventCard
                event={ev}
                onClick={() => onSelectEvent(ev.slug)}
                variant="rail"
              />
            </div>
          ))}
        </ContentRail>
      )}

      {/* =========================================================================
          7. RAIL 5: JELAJAH KHAZANAH DAERAH (INTERACTIVE REGIONAL SELECTOR RAIL)
          ========================================================================= */}
      <section className="space-y-4">
        <div className="px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold text-[var(--color-maroon,#800020)] uppercase tracking-wider mb-0.5">
              Dari Sabang Sampai Merauke
            </div>
            <h2 className="font-serif font-bold text-lg sm:text-xl md:text-2xl text-[var(--color-charcoal,#292522)] tracking-tight">
              Jelajahi Cerita Berdasarkan Wilayah
            </h2>
          </div>

          {/* Region Tabs (Horizontal Pills) */}
          <div className="flex gap-1.5 overflow-x-auto touch-pan-x no-scrollbar pb-1">
            {regionTabs.map((reg) => (
              <button
                key={reg.value}
                type="button"
                onClick={() => setSelectedRegion(reg.value)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedRegion === reg.value
                    ? 'bg-[var(--color-maroon,#800020)] text-white shadow-xs'
                    : 'bg-white text-[var(--color-muted-text,#6D675F)] hover:bg-[#F1ECE0] border border-[var(--color-border-sand,#E5DED2)]'
                }`}
              >
                {reg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rail of Stories in selected region */}
        <div className="flex gap-4 overflow-x-auto touch-pan-x no-scrollbar px-4 sm:px-6 lg:px-8 py-1 snap-x snap-mandatory scroll-pl-4">
          {filteredRegionalStories.map((item) => (
            <div key={item.content_id} className="w-64 sm:w-72 shrink-0 snap-start">
              <ContentCard
                item={item}
                onClick={() => onSelectContent(item.slug)}
                variant="landscape"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
