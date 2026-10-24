import React, { useState, useEffect } from 'react';
import { Gamepad2, Search, Users, Sparkles, BookOpen, ChevronRight } from 'lucide-react';
import { ContentCard } from '../components/cards/ContentCard';
import { ContentItem, Subcategory } from '../types';
import { api } from '../services/apiClient';
import { useSiteConfig } from '../services/SiteConfigContext';

interface GelanggangPageProps {
  onSelectContent: (slug: string) => void;
}

export const GelanggangPage: React.FC<GelanggangPageProps> = ({ onSelectContent }) => {
  const { config } = useSiteConfig();
  const catConfig = config.categories.find((c) => c.slug === 'gelanggang');

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
          api.getContentList({ categoryId: 'gelanggang', status: 'published', limit: 30 }),
          api.getSubcategories('gelanggang')
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
      const mReg = item.origin_province.toLowerCase().includes(q);
      if (!mTitle && !mDesc && !mReg) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
      {/* Editorial Header Banner */}
      <header className="p-6 sm:p-8 rounded-2xl md:rounded-3xl bg-gradient-to-r from-[#8C391D] via-[var(--color-terracotta,#C65D3A)] to-[#592312] text-white border border-[var(--color-gold,#D4A373)]/30 shadow-xl relative overflow-hidden">
        {config.theme.enableBatikPatterns && (
          <div className="absolute inset-0 batik-pattern opacity-10 pointer-events-none" />
        )}
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[#F8F3E9] text-xs font-semibold tracking-wide">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>{catConfig?.badgeLabel || 'Permainan Tradisional'}</span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-4xl text-white">
            {catConfig?.displayName || 'Gelanggang'}
          </h1>
          <p className="text-xs sm:text-sm text-[#F8F3E9]/90 leading-relaxed max-w-xl">
            {catConfig?.description || 'Ensiklopedia dan tutorial video permainan tradisional nusantara: aturan main, alat & bahan, taktik berhitung, serta nilai sportivitas kebersamaan.'}
          </p>
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        {/* Subcategories Horizontal Scroll Rail */}
        <div className="flex items-center gap-2 overflow-x-auto touch-pan-x no-scrollbar pb-1">
          <button
            onClick={() => setSelectedSubcat('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedSubcat === 'all'
                ? 'bg-[var(--color-terracotta,#C65D3A)] text-white shadow-xs'
                : 'bg-white text-[var(--color-muted-text,#6D675F)] hover:bg-[#F1ECE0] border border-[var(--color-border-sand,#E5DED2)]'
            }`}
          >
            Semua Jenis Permainan
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub.subcategory_id}
              onClick={() => setSelectedSubcat(sub.subcategory_id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedSubcat === sub.subcategory_id
                  ? 'bg-[var(--color-terracotta,#C65D3A)] text-white shadow-xs'
                  : 'bg-white text-[var(--color-muted-text,#6D675F)] hover:bg-[#F1ECE0] border border-[var(--color-border-sand,#E5DED2)]'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8E867B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari permainan (contoh: Congklak, Gobak Sodor, Egrang, Engklek)..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[var(--color-border-sand,#E5DED2)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-terracotta,#C65D3A)] text-[var(--color-charcoal,#292522)]"
          />
        </div>
      </div>

      {/* Tutorial Cards Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 border-2 border-[var(--color-terracotta,#C65D3A)] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-[var(--color-muted-text,#6D675F)]">Memuat ensiklopedia Gelanggang...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-[var(--color-border-sand,#E5DED2)] p-8 max-w-md mx-auto">
          <Gamepad2 className="w-10 h-10 text-[#8E867B] mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-[var(--color-charcoal,#292522)] mb-1">
            Permainan tidak ditemukan
          </h3>
          <p className="text-xs text-[var(--color-muted-text,#6D675F)]">
            Coba gunakan kata kunci nama permainan atau daerah lain.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <ContentCard
              key={item.content_id}
              item={item}
              onClick={() => onSelectContent(item.slug)}
              variant="tutorial"
            />
          ))}
        </div>
      )}
    </div>
  );
};
