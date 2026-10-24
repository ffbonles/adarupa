import React, { useState, useEffect } from 'react';
import { Film, Search, Filter, SlidersHorizontal, Play, Sparkles } from 'lucide-react';
import { ContentCard } from '../components/cards/ContentCard';
import { ContentItem, Subcategory } from '../types';
import { api } from '../services/apiClient';
import { useSiteConfig } from '../services/SiteConfigContext';

interface LalakonPageProps {
  onSelectContent: (slug: string) => void;
}

export const LalakonPage: React.FC<LalakonPageProps> = ({ onSelectContent }) => {
  const { config } = useSiteConfig();
  const catConfig = config.categories.find((c) => c.slug === 'lalakon');

  const [items, setItems] = useState<ContentItem[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubcat, setSelectedSubcat] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'title' | 'duration'>('latest');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [contentRes, subRes] = await Promise.all([
          api.getContentList({ categoryId: 'lalakon', status: 'published', limit: 30 }),
          api.getSubcategories('lalakon')
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

  const filteredItems = items
    .filter((item) => {
      if (selectedSubcat !== 'all' && item.subcategory_id !== selectedSubcat) return false;
      if (selectedRegion !== 'all' && item.origin_province.toLowerCase() !== selectedRegion.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTitle = item.title.toLowerCase().includes(q);
        const mDesc = item.description.toLowerCase().includes(q);
        const mReg = item.origin_province.toLowerCase().includes(q);
        if (!mTitle && !mDesc && !mReg) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'duration') return b.duration_seconds - a.duration_seconds;
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    });

  const featuredFilm = items.find((i) => i.is_featured) || items[0];
  const regions = Array.from(new Set(items.map((i) => i.origin_province))).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
      {/* Featured Film / Folklore Banner (Cinematic Mobile App Feel) */}
      {featuredFilm ? (
        <section
          onClick={() => onSelectContent(featuredFilm.slug)}
          className="relative rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer group shadow-xl bg-stone-900 border border-[var(--color-gold,#D4A373)]/30 select-none"
        >
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden">
            {featuredFilm.cover_url ? (
              <img
                src={featuredFilm.cover_url}
                alt={featuredFilm.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-[#590018] via-[#800020] to-[#122820]" />
            )}

            {/* Darkening gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

            {/* Cultural pattern */}
            {config.theme.enableBatikPatterns && (
              <div className="absolute inset-0 batik-pattern opacity-10 pointer-events-none" />
            )}

            {/* Story Details Overlay */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--color-maroon,#800020)] text-white text-[11px] font-bold">
                <Sparkles className="w-3 h-3 text-[var(--color-gold,#D4A373)]" />
                <span>{catConfig?.badgeLabel || 'Karya Unggulan'}</span>
              </div>
              <h1 className="font-serif font-bold text-xl sm:text-3xl text-white drop-shadow-md">
                {featuredFilm.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#D6CEBE] max-w-xl line-clamp-2 drop-shadow-xs font-sans">
                {featuredFilm.description}
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-full bg-[var(--color-maroon,#800020)] hover:bg-[var(--color-maroon-deep,#590018)] text-white text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Putar Film</span>
                </button>
                <span className="text-xs text-[var(--color-gold,#D4A373)] font-medium">
                  {featuredFilm.origin_province} · {Math.floor(featuredFilm.duration_seconds / 60)} mnt
                </span>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <header className="p-6 rounded-2xl bg-gradient-to-r from-[var(--color-maroon-deep,#590018)] to-[var(--color-maroon,#800020)] text-white">
          <h1 className="font-serif font-bold text-2xl">{catConfig?.displayName || 'Lalakon'}</h1>
          <p className="text-xs text-[#D6CEBE] mt-1">{catConfig?.description}</p>
        </header>
      )}

      {/* Subcategory & Region Filter Rails (Interactive Controls) */}
      <div className="space-y-3">
        {/* Subcategories Horizontal Scroll Rail */}
        <div className="flex items-center gap-2 overflow-x-auto touch-pan-x no-scrollbar pb-1">
          <button
            onClick={() => setSelectedSubcat('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedSubcat === 'all'
                ? 'bg-[var(--color-maroon,#800020)] text-white shadow-xs'
                : 'bg-white text-[var(--color-muted-text,#6D675F)] hover:bg-[#F1ECE0] border border-[var(--color-border-sand,#E5DED2)]'
            }`}
          >
            Semua Subkategori
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub.subcategory_id}
              onClick={() => setSelectedSubcat(sub.subcategory_id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedSubcat === sub.subcategory_id
                  ? 'bg-[var(--color-maroon,#800020)] text-white shadow-xs'
                  : 'bg-white text-[var(--color-muted-text,#6D675F)] hover:bg-[#F1ECE0] border border-[var(--color-border-sand,#E5DED2)]'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>

        {/* Compact Search and Sort Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8E867B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari cerita rakyat, legenda nusantara..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[var(--color-border-sand,#E5DED2)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-maroon,#800020)] text-[var(--color-charcoal,#292522)]"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="text-[11px] text-[var(--color-muted-text,#6D675F)] whitespace-nowrap">Urutan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-white border border-[var(--color-border-sand,#E5DED2)] rounded-xl px-2.5 py-2 text-[var(--color-charcoal,#292522)] focus:outline-none"
            >
              <option value="latest">Terbaru</option>
              <option value="title">Judul (A-Z)</option>
              <option value="duration">Durasi Terpanjang</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Streaming Cards */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 border-2 border-[var(--color-maroon,#800020)] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-[var(--color-muted-text,#6D675F)]">Memuat karya Lalakon...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-[var(--color-border-sand,#E5DED2)] p-8 max-w-md mx-auto">
          <Film className="w-10 h-10 text-[#8E867B] mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-[var(--color-charcoal,#292522)] mb-1">
            {config.uiStrings.noResultsFoundTitle || 'Tidak ada karya yang sesuai'}
          </h3>
          <p className="text-xs text-[var(--color-muted-text,#6D675F)] mb-4">
            {config.uiStrings.noResultsFoundDescription || 'Coba ubah kata kunci pencarian atau bersihkan filter subkategori.'}
          </p>
          <button
            onClick={() => {
              setSelectedSubcat('all');
              setSelectedRegion('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-xs bg-[var(--color-maroon,#800020)] text-white rounded-full hover:bg-[var(--color-maroon-deep,#590018)] cursor-pointer"
          >
            {config.uiStrings.resetFilterLabel || 'Atur Ulang Filter'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <ContentCard
              key={item.content_id}
              item={item}
              onClick={() => onSelectContent(item.slug)}
              variant="landscape"
            />
          ))}
        </div>
      )}
    </div>
  );
};
