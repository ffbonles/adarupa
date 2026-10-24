import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Search,
  MapPin,
  List,
  Grid,
  Filter,
  CheckCircle2,
  CalendarPlus,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { EventCard } from '../components/cards/EventCard';
import { CulturalEvent, EventStatus } from '../types';
import { api } from '../services/apiClient';
import { useSiteConfig } from '../services/SiteConfigContext';

interface PagelaranPageProps {
  onSelectEvent: (slug: string) => void;
}

export const PagelaranPage: React.FC<PagelaranPageProps> = ({ onSelectEvent }) => {
  const { config } = useSiteConfig();
  const catConfig = config.categories.find((c) => c.slug === 'pagelaran');

  const [events, setEvents] = useState<CulturalEvent[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true);
      try {
        const res = await api.getEvents();
        setEvents(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadEvents();
  }, []);

  const categories = [
    'Festival Budaya',
    'Pertunjukan Seni',
    'Pameran Budaya',
    'Upacara Adat',
    'Lokakarya dan Edukasi'
  ];

  const provinces = Array.from(new Set(events.map((e) => e.province))).filter(Boolean);

  const filteredEvents = events.filter((ev) => {
    if (selectedCategory !== 'all' && ev.category !== selectedCategory) return false;
    if (selectedProvince !== 'all' && ev.province.toLowerCase() !== selectedProvince.toLowerCase()) return false;
    if (selectedStatus !== 'all' && ev.event_status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const mTitle = ev.title.toLowerCase().includes(q);
      const mVenue = ev.venue.toLowerCase().includes(q);
      const mCity = ev.city.toLowerCase().includes(q);
      const mProv = ev.province.toLowerCase().includes(q);
      if (!mTitle && !mVenue && !mCity && !mProv) return false;
    }
    return true;
  });

  const featuredEvent = events.find((e) => e.event_status === 'upcoming') || events[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
      {/* Editorial Header Banner */}
      <header className="p-6 sm:p-8 rounded-2xl md:rounded-3xl bg-gradient-to-r from-[var(--color-maroon,#800020)] via-[var(--color-maroon-deep,#590018)] to-[var(--color-forest,#1B3A2F)] text-white border border-[var(--color-gold,#D4A373)]/30 shadow-xl relative overflow-hidden">
        {config.theme.enableBatikPatterns && (
          <div className="absolute inset-0 batik-pattern opacity-10 pointer-events-none" />
        )}
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[var(--color-gold,#D4A373)] text-xs font-semibold tracking-wide">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{catConfig?.badgeLabel || 'Agenda & Festival Budaya'}</span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-4xl text-white">
            {catConfig?.displayName || 'Pagelaran'}
          </h1>
          <p className="text-xs sm:text-sm text-[#D6CEBE] leading-relaxed max-w-xl">
            {catConfig?.description || 'Kalender perhelatan kebudayaan se-Indonesia: festival tahunan, karnaval perahu adat, eksibisi pusaka keris, pentas gamelan, dan upacara syukuran adat.'}
          </p>
        </div>
      </header>

      {/* Featured Upcoming Event Marquee */}
      {featuredEvent && (
        <section
          onClick={() => onSelectEvent(featuredEvent.slug)}
          className="bg-white rounded-2xl p-5 sm:p-6 border border-[var(--color-border-sand,#E5DED2)] shadow-xs hover:border-[var(--color-maroon,#800020)] transition-all cursor-pointer flex flex-col md:flex-row gap-5 items-center group select-none"
        >
          <div className="w-full md:w-5/12 aspect-video bg-stone-900 rounded-xl overflow-hidden relative shrink-0 shadow-md">
            {featuredEvent.poster_url ? (
              <img
                src={featuredEvent.poster_url}
                alt={featuredEvent.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#800020] to-[#1B3A2F]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
            <div className="absolute top-2.5 left-2.5 z-20 bg-[var(--color-maroon,#800020)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Sorotan Agenda Terdekat
            </div>
            <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 text-white">
              <p className="text-[11px] text-[var(--color-gold,#D4A373)] font-medium">{featuredEvent.province}</p>
              <p className="font-serif font-bold text-sm sm:text-base line-clamp-1">{featuredEvent.title}</p>
            </div>
          </div>

          <div className="flex-1 space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-[var(--color-muted-text,#6D675F)] font-medium">
              <span className="text-[var(--color-maroon,#800020)] font-bold">{featuredEvent.category}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[var(--color-gold,#D4A373)]" /> {featuredEvent.venue}, {featuredEvent.city}
              </span>
            </div>

            <h2 className="font-serif font-bold text-lg sm:text-xl text-[var(--color-charcoal,#292522)] group-hover:text-[var(--color-maroon,#800020)] transition-colors">
              {featuredEvent.title}
            </h2>

            <p className="text-xs text-[var(--color-muted-text,#6D675F)] line-clamp-2 leading-relaxed">
              {featuredEvent.description}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-[var(--color-maroon,#800020)] group-hover:underline flex items-center gap-1">
                Lihat Jadwal & Ekspor Kalender →
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Filter and View Mode Switcher */}
      <div className="space-y-3">
        {/* Category Horizontal Filter Rail */}
        <div className="flex items-center gap-2 overflow-x-auto touch-pan-x no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[var(--color-maroon,#800020)] text-white shadow-xs'
                : 'bg-white text-[var(--color-muted-text,#6D675F)] hover:bg-[#F1ECE0] border border-[var(--color-border-sand,#E5DED2)]'
            }`}
          >
            Semua Pagelaran
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[var(--color-maroon,#800020)] text-white shadow-xs'
                  : 'bg-white text-[var(--color-muted-text,#6D675F)] hover:bg-[#F1ECE0] border border-[var(--color-border-sand,#E5DED2)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Compact Search & Layout Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8E867B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pagelaran, kota, tempat pertunjukan, atau upacara..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[var(--color-border-sand,#E5DED2)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-maroon,#800020)] text-[var(--color-charcoal,#292522)]"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Province dropdown */}
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="bg-white border border-[var(--color-border-sand,#E5DED2)] rounded-xl px-2.5 py-2 text-xs text-[var(--color-charcoal,#292522)] focus:outline-none"
            >
              <option value="all">Semua Provinsi</option>
              {provinces.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-white border border-[var(--color-border-sand,#E5DED2)] rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition cursor-pointer ${
                  viewMode === 'list' ? 'bg-[var(--color-maroon,#800020)] text-white font-semibold' : 'text-[#6D675F]'
                }`}
                title="Tampilan Daftar Kronologis"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-[var(--color-maroon,#800020)] text-white font-semibold' : 'text-[#6D675F]'
                }`}
                title="Tampilan Kisi Poster"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Events List / Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 border-2 border-[var(--color-maroon,#800020)] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-[var(--color-muted-text,#6D675F)]">Memuat agenda pagelaran nusantara...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-[var(--color-border-sand,#E5DED2)] p-8 max-w-md mx-auto">
          <CalendarIcon className="w-10 h-10 text-[#8E867B] mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-[var(--color-charcoal,#292522)] mb-1">
            Tidak ada perhelatan yang sesuai
          </h3>
          <p className="text-xs text-[var(--color-muted-text,#6D675F)] mb-4">
            Coba sesuaikan filter provinsi atau kategori agenda.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedProvince('all');
              setSelectedStatus('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-xs bg-[var(--color-maroon,#800020)] text-white rounded-full hover:bg-[var(--color-maroon-deep,#590018)] cursor-pointer"
          >
            Atur Ulang Filter
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredEvents.map((ev) => (
            <EventCard
              key={ev.event_id}
              event={ev}
              onClick={() => onSelectEvent(ev.slug)}
              variant="list"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => (
            <EventCard
              key={ev.event_id}
              event={ev}
              onClick={() => onSelectEvent(ev.slug)}
              variant="rail"
            />
          ))}
        </div>
      )}
    </div>
  );
};
