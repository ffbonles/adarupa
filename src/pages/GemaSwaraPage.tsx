import React, { useState, useEffect } from 'react';
import { Headphones, Search, Play, ListMusic, Disc, Sparkles } from 'lucide-react';
import { ContentCard } from '../components/cards/ContentCard';
import { ContentItem, Subcategory, Series } from '../types';
import { api } from '../services/apiClient';
import { useSiteConfig } from '../services/SiteConfigContext';

interface GemaSwaraPageProps {
  onSelectContent: (slug: string) => void;
  onPlayAudioTrack: (item: ContentItem, episodeList?: ContentItem[]) => void;
}

export const GemaSwaraPage: React.FC<GemaSwaraPageProps> = ({
  onSelectContent,
  onPlayAudioTrack
}) => {
  const { config } = useSiteConfig();
  const catConfig = config.categories.find((c) => c.slug === 'gema-swara');

  const [items, setItems] = useState<ContentItem[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubcat, setSelectedSubcat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [contentRes, subRes] = await Promise.all([
          api.getContentList({ categoryId: 'gema-swara', status: 'published', limit: 30 }),
          api.getSubcategories('gema-swara')
        ]);
        setItems(contentRes.data || []);
        setSubcategories(subRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredItems = items.filter((item) => {
    if (selectedSubcat !== 'all' && item.subcategory_id !== selectedSubcat) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const mTitle = item.title.toLowerCase().includes(q);
      const mDesc = item.description.toLowerCase().includes(q);
      const mSer = item.series_title?.toLowerCase().includes(q);
      if (!mTitle && !mDesc && !mSer) return false;
    }
    return true;
  });

  // Series grouped
  const seriesGroups: { [seriesId: string]: ContentItem[] } = {};
  items.forEach((item) => {
    if (item.series_id) {
      if (!seriesGroups[item.series_id]) seriesGroups[item.series_id] = [];
      seriesGroups[item.series_id].push(item);
    }
  });

  const seriesList = Object.values(
    items.reduce<Record<string, { series_id: string; title: string; description: string; total_episodes: number }>>((groups, item) => {
      if (!item.series_id) return groups;
      if (!groups[item.series_id]) {
        groups[item.series_id] = {
          series_id: item.series_id,
          title: item.series_title || item.title,
          description: item.description || '',
          total_episodes: 0
        };
      }
      groups[item.series_id].total_episodes += 1;
      return groups;
    }, {})
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
      {/* Editorial Header Banner */}
      <header className="p-6 sm:p-8 rounded-2xl md:rounded-3xl bg-gradient-to-r from-[#122820] via-[var(--color-forest,#1B3A2F)] to-[#0A1713] text-white border border-[var(--color-gold,#D4A373)]/30 shadow-xl relative overflow-hidden">
        {config.theme.enableBatikPatterns && (
          <div className="absolute inset-0 batik-pattern opacity-10 pointer-events-none" />
        )}
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[var(--color-gold,#D4A373)] text-xs font-semibold tracking-wide">
            <Headphones className="w-3.5 h-3.5 text-[var(--color-gold,#D4A373)]" />
            <span>{catConfig?.badgeLabel || 'Tutur Audio & Sandiwara'}</span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-4xl text-white">
            {catConfig?.displayName || 'Gema Swara'}
          </h1>
          <p className="text-xs sm:text-sm text-[#D6CEBE] leading-relaxed max-w-xl">
            {catConfig?.description || 'Pengalaman audio mendalam: sandiwara radio legendaris, dongeng fabel, narasi sejarah, dan lantunan musik tradisi kepulauan.'}
          </p>
        </div>
      </header>

      {/* Featured Radio Series Showcase */}
      <section className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <h2 className="font-serif font-bold text-base sm:text-lg text-[var(--color-charcoal,#292522)] flex items-center gap-2">
            <Disc className="w-4 h-4 text-[var(--color-maroon,#800020)]" />
            <span>Seri Sandiwara & Podcast Bersambung</span>
          </h2>
          <span className="text-xs text-[var(--color-muted-text,#6D675F)]">Tersedia per babak</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {seriesList.length === 0 && (
            <p className="col-span-full rounded-xl border border-dashed p-6 text-sm text-[var(--color-muted-text,#6D675F)]">
              Belum ada seri audio yang tersedia dari backend.
            </p>
          )}
          {seriesList.map((ser) => {
            const seriesEpisodes = seriesGroups[ser.series_id] || [];
            return (
              <div
                key={ser.series_id}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-[var(--color-border-sand,#E5DED2)] shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[var(--color-maroon,#800020)] font-semibold mb-1">
                    <span>Sandiwara Radio Berseri</span>
                    <span className="tabular-nums font-mono text-[var(--color-muted-text,#6D675F)]">
                      {seriesEpisodes.length || ser.total_episodes} Episode
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--color-charcoal,#292522)]">
                    {ser.title}
                  </h3>
                  <p className="text-xs text-[var(--color-muted-text,#6D675F)] mt-1 line-clamp-2 leading-relaxed">
                    {ser.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-sand)]/60 text-xs">
                  <span className="text-[var(--color-muted-text,#8E867B)]">Format Audio Digital</span>
                  {seriesEpisodes.length > 0 && (
                    <button
                      onClick={() => onPlayAudioTrack(seriesEpisodes[0], seriesEpisodes)}
                      className="px-3.5 py-1.5 rounded-full bg-[var(--color-forest,#1B3A2F)] text-white hover:bg-[var(--color-forest-dark,#122820)] font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Putar Babak 1</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        {/* Subcategories Horizontal Scroll Rail */}
        <div className="flex items-center gap-2 overflow-x-auto touch-pan-x no-scrollbar pb-1">
          <button
            onClick={() => setSelectedSubcat('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedSubcat === 'all'
                ? 'bg-[var(--color-forest,#1B3A2F)] text-white shadow-xs'
                : 'bg-white text-[var(--color-muted-text,#6D675F)] hover:bg-[#F1ECE0] border border-[var(--color-border-sand,#E5DED2)]'
            }`}
          >
            Semua Format Audio
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub.subcategory_id}
              onClick={() => setSelectedSubcat(sub.subcategory_id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedSubcat === sub.subcategory_id
                  ? 'bg-[var(--color-forest,#1B3A2F)] text-white shadow-xs'
                  : 'bg-white text-[var(--color-muted-text,#6D675F)] hover:bg-[#F1ECE0] border border-[var(--color-border-sand,#E5DED2)]'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>

        {/* Compact Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8E867B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari dongeng audio, sandiwara radio, podcast rempah..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[var(--color-border-sand,#E5DED2)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-forest,#1B3A2F)] text-[var(--color-charcoal,#292522)]"
          />
        </div>
      </div>

      {/* Audio Grid (Square Disc Artwork) */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 border-2 border-[var(--color-forest,#1B3A2F)] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-[var(--color-muted-text,#6D675F)]">Memuat khazanah audio...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-[var(--color-border-sand,#E5DED2)] p-8 max-w-md mx-auto">
          <Headphones className="w-10 h-10 text-[#8E867B] mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-[var(--color-charcoal,#292522)] mb-1">
            Audio tidak ditemukan
          </h3>
          <p className="text-xs text-[var(--color-muted-text,#6D675F)]">
            Coba ubah kata kunci atau pilih subkategori lain.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <ContentCard
              key={item.content_id}
              item={item}
              onClick={() => onSelectContent(item.slug)}
              onPlayAudio={(track) => {
                const relSeries = track.series_id ? seriesGroups[track.series_id] : undefined;
                onPlayAudioTrack(track, relSeries);
              }}
              variant="audio"
            />
          ))}
        </div>
      )}
    </div>
  );
};
