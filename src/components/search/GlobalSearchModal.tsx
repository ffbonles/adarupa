import React, { useState, useEffect } from 'react';
import { Search, X, Film, Headphones, Gamepad2, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { api } from '../../services/apiClient';
import { ContentItem, CulturalEvent } from '../../types';
import { useSiteConfig } from '../../services/SiteConfigContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContent: (slug: string) => void;
  onSelectEvent: (slug: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectContent,
  onSelectEvent
}) => {
  const { config } = useSiteConfig();
  const [query, setQuery] = useState('');
  const [contentResults, setContentResults] = useState<ContentItem[]>([]);
  const [eventResults, setEventResults] = useState<CulturalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setContentResults([]);
      setEventResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        try {
          const [contentRes, eventRes] = await Promise.all([
            api.getContentList({ search: query.trim(), status: 'published', limit: 8 }),
            api.getEvents({ search: query.trim() })
          ]);

          setContentResults(contentRes.data || []);
          setEventResults(eventRes.data || []);
        } catch {
          setContentResults([]);
          setEventResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setContentResults([]);
        setEventResults([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const totalResults = contentResults.length + eventResults.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-[#F8F3E9] rounded-2xl shadow-2xl border border-[#E5DED2] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E5DED2] bg-white">
          <Search className="w-5 h-5 text-[#800020] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={config.uiStrings.searchPlaceholder || "Cari cerita rakyat, audio sandiwara, permainan tradisional, pagelaran..."}
            className="w-full text-sm sm:text-base text-[#292522] placeholder-[#8E867B] focus:outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#8E867B] hover:text-[#292522] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-medium text-[#6D675F] hover:text-[#292522] px-2 py-1 rounded bg-[#F1ECE0] border border-[#E5DED2]"
          >
            Esc
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-5">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-[#6D675F]">
              <div className="w-8 h-8 border-2 border-[var(--color-maroon,#800020)] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs">Mencari khazanah nusantara...</p>
            </div>
          ) : query.trim().length < 2 ? (
            <div className="py-8 text-center text-xs text-[#8E867B]">
              <p className="font-medium text-[#292522] mb-1">Pencarian Khazanah {config.brand.appName}</p>
              <p>Ketik minimal 2 karakter (misal: "Sangkuriang", "Congklak", "Bali", "Gayo").</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-10 text-center text-[#6D675F]">
              <p className="text-sm font-semibold text-[#292522] mb-1">
                {config.uiStrings.noResultsFoundTitle || 'Tidak ada hasil untuk'} "{query}"
              </p>
              <p className="text-xs max-w-sm mx-auto text-[#8E867B]">
                {config.uiStrings.noResultsFoundDescription || 'Coba gunakan kata kunci nama daerah, judul cerita rakyat, atau jenis permainan lain.'}
              </p>
            </div>
          ) : (
            <>
              {/* Content Items */}
              {contentResults.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-semibold text-[#800020] uppercase tracking-wider mb-2.5 flex items-center justify-between">
                    <span>Koleksi Budaya ({contentResults.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {contentResults.map((item) => {
                      const Icon = item.category_id === 'lalakon' ? Film : item.category_id === 'gema-swara' ? Headphones : Gamepad2;
                      return (
                        <button
                          key={item.content_id}
                          onClick={() => {
                            onSelectContent(item.slug);
                            onClose();
                          }}
                          className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-[#F1ECE0] border border-[#E5DED2] flex items-center justify-between gap-3 group transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#800020]/10 text-[#800020] flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-[#292522] group-hover:text-[#800020] truncate">
                                {item.title}
                              </p>
                              <div className="flex items-center gap-1.5 text-[11px] text-[#6D675F]">
                                <span>{item.subcategory_name || item.category_id}</span>
                                <span>·</span>
                                <span>{item.origin_province}</span>
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#8E867B] group-hover:text-[#800020] shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pagelaran Events */}
              {eventResults.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-semibold text-[#1B3A2F] uppercase tracking-wider mb-2.5">
                    Pagelaran & Upacara ({eventResults.length})
                  </h4>
                  <div className="space-y-1.5">
                    {eventResults.map((ev) => (
                      <button
                        key={ev.event_id}
                        onClick={() => {
                          onSelectEvent(ev.slug);
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-[#F1ECE0] border border-[#E5DED2] flex items-center justify-between gap-3 group transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#1B3A2F]/10 text-[#1B3A2F] flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-[#292522] group-hover:text-[#1B3A2F] truncate">
                              {ev.title}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-[#6D675F]">
                              <span>{ev.city}, {ev.province}</span>
                              <span>·</span>
                              <span className="text-emerald-700">{ev.event_status}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#8E867B] group-hover:text-[#1B3A2F] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
