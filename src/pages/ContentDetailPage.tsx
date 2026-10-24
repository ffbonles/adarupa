import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Share2,
  Clock,
  MapPin,
  Users,
  ShieldAlert,
  BookOpen,
  Award,
  Sparkles,
  Check,
  Headphones,
  Film,
  ExternalLink
} from 'lucide-react';
import { VideoPlayer } from '../components/media/VideoPlayer';
import { ContentCard } from '../components/cards/ContentCard';
import { ContentItem } from '../types';
import { api } from '../services/apiClient';

interface ContentDetailPageProps {
  slug: string;
  onBack: () => void;
  onSelectContent: (slug: string) => void;
  onPlayAudioTrack?: (item: ContentItem) => void;
}

export const ContentDetailPage: React.FC<ContentDetailPageProps> = ({
  slug,
  onBack,
  onSelectContent,
  onPlayAudioTrack
}) => {
  const [content, setContent] = useState<ContentItem | null>(null);
  const [related, setRelated] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    async function loadItem() {
      setIsLoading(true);
      try {
        const res = await api.getContentBySlug(slug);
        if (res.data) {
          setContent(res.data);
          const relRes = await api.getRelatedContent(res.data.content_id, res.data.category_id);
          setRelated(relRes.data || []);
        } else {
          setContent(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadItem();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-2 border-[#800020] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#6D675F]">Membuka khazanah kebudayaan...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif font-bold text-2xl text-[#292522] mb-2">Karya Tidak Ditemukan</h2>
        <p className="text-xs text-[#6D675F] mb-6">
          Karya budaya yang Anda cari tidak tersedia atau belum dipublikasikan oleh kurator.
        </p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-[#800020] text-white text-xs font-semibold rounded-lg hover:bg-[#590018] inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const isAudio = content.content_type === 'audio' || content.category_id === 'gema-swara';
  const isTutorial = content.category_id === 'gelanggang';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6D675F] hover:text-[#800020] transition-colors py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5DED2] rounded-lg text-xs font-medium text-[#6D675F] hover:text-[#292522] hover:bg-[#F1ECE0] transition-colors"
        >
          {copiedShare ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Tautan Disalin!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-[#800020]" />
              <span>Bagikan Kisah</span>
            </>
          )}
        </button>
      </div>

      {/* Main Media Player Presentation Area */}
      <div className="space-y-4">
        {isAudio ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-[#1B3A2F] text-white border border-[#D4A373]/30 shadow-xl flex flex-col sm:flex-row items-center gap-8">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-[#590018] flex items-center justify-center border-2 border-[#D4A373]/40 shadow-lg shrink-0">
              <Headphones className="w-12 h-12 text-[#D4A373]" />
            </div>
            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div className="text-xs text-[#D4A373] font-semibold uppercase tracking-wider">
                {content.series_title || content.subcategory_name || 'Gema Swara Nusantara'}
              </div>
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-white">
                {content.title}
              </h1>
              <p className="text-xs text-[#D6CEBE] max-w-xl">
                {content.description}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onPlayAudioTrack && onPlayAudioTrack(content)}
                  className="px-6 py-2.5 rounded-xl bg-[#D4A373] hover:bg-[#E7C9A9] text-[#1B3A2F] font-bold text-xs sm:text-sm transition-transform active:scale-95 shadow-md inline-flex items-center gap-2"
                >
                  <Headphones className="w-4 h-4" /> Putar Audio Sekarang
                </button>
              </div>
            </div>
          </div>
        ) : (
          <VideoPlayer
            title={content.title}
            mediaUrl={content.media_url}
            driveFileId={content.drive_file_id}
            posterUrl={content.cover_url}
          />
        )}
      </div>

      {/* Content Header & Metadata */}
      <div className="space-y-4 pb-6 border-b border-[#E5DED2]">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#6D675F] font-medium">
          <span className="text-[#800020] font-semibold">
            {content.subcategory_name || content.category_id}
          </span>
          <span aria-hidden="true" className="text-[#D4A373]">·</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#D4A373]" /> {content.origin_province}
          </span>
          {content.duration_seconds > 0 && (
            <>
              <span aria-hidden="true" className="text-[#D4A373]">·</span>
              <span className="flex items-center gap-1 font-mono tabular-nums">
                <Clock className="w-3.5 h-3.5 text-[#D4A373]" /> {Math.floor(content.duration_seconds / 60)} menit
              </span>
            </>
          )}
        </div>

        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#292522]">
          {content.title}
        </h1>

        <div className="max-w-3xl text-sm text-[#292522] leading-relaxed space-y-3 font-sans">
          <p>{content.description}</p>
        </div>
      </div>

      {/* Gelanggang Tutorial Guide (Rules, Equipment, Players, Instructions, Safety) */}
      {isTutorial && content.tutorial_data && (
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5DED2] shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F1ECE0]">
            <BookOpen className="w-5 h-5 text-[#C65D3A]" />
            <h2 className="font-serif font-bold text-xl text-[#292522]">
              Panduan Permainan & Aturan Main
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Alat & Jumlah Pemain */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-[#800020] uppercase tracking-wider mb-2">
                  Jumlah Pemain
                </h3>
                <div className="p-3 bg-[#F8F3E9] rounded-xl border border-[#E5DED2] text-xs font-medium text-[#292522] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#C65D3A]" />
                  <span>{content.tutorial_data.players_count}</span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-[#800020] uppercase tracking-wider mb-2">
                  Alat dan Bahan
                </h3>
                <ul className="space-y-2 text-xs text-[#292522]">
                  {content.tutorial_data.equipment.map((eq, i) => (
                    <li key={i} className="flex items-start gap-2 p-2 bg-[#F8F3E9] rounded-lg border border-[#E5DED2]">
                      <span className="w-4 h-4 rounded-full bg-[#C65D3A] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{eq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Aturan Permainan */}
            <div>
              <h3 className="text-xs font-semibold text-[#800020] uppercase tracking-wider mb-2">
                Aturan & Regulasi
              </h3>
              <ul className="space-y-2 text-xs text-[#292522]">
                {content.tutorial_data.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#C65D3A] font-bold">·</span>
                    <span className="leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          {content.tutorial_data.instructions && content.tutorial_data.instructions.length > 0 && (
            <div className="pt-4 border-t border-[#F1ECE0]">
              <h3 className="text-xs font-semibold text-[#800020] uppercase tracking-wider mb-3">
                Langkah-Langkah Praktis
              </h3>
              <div className="space-y-2 text-xs text-[#292522]">
                {content.tutorial_data.instructions.map((step, sIdx) => (
                  <div key={sIdx} className="p-3 bg-[#F8F3E9] rounded-xl border border-[#E5DED2] leading-relaxed">
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety Considerations */}
          {content.tutorial_data.safety_notes && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Catatan Keselamatan:</strong>
                <span>{content.tutorial_data.safety_notes}</span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Audio Transcript (for Gema Swara) */}
      {isAudio && content.audio_transcript && (
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5DED2] shadow-sm space-y-3">
          <h2 className="font-serif font-bold text-lg text-[#292522]">
            Transkrip Tutur Cerita
          </h2>
          <div className="p-4 bg-[#F8F3E9] rounded-xl border border-[#E5DED2] text-xs text-[#292522] leading-relaxed italic font-serif">
            "{content.audio_transcript}"
          </div>
        </section>
      )}

      {/* Curatorial Attribution & Credits Box */}
      {content.credits && (
        <section className="bg-white rounded-2xl p-6 border border-[#E5DED2] shadow-sm space-y-3">
          <h2 className="font-serif font-semibold text-sm text-[#800020] uppercase tracking-wider">
            Atribusi & Kurasi Kebudayaan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {content.credits.director_or_teller && (
              <div>
                <span className="text-[#8E867B] block">Sutradara / Penutur:</span>
                <span className="font-medium text-[#292522]">{content.credits.director_or_teller}</span>
              </div>
            )}
            {content.credits.production_or_source && (
              <div>
                <span className="text-[#8E867B] block">Sumber / Sanggar:</span>
                <span className="font-medium text-[#292522]">{content.credits.production_or_source}</span>
              </div>
            )}
            {content.credits.cultural_consultant && (
              <div>
                <span className="text-[#8E867B] block">Konsultan Budaya:</span>
                <span className="font-medium text-[#292522]">{content.credits.cultural_consultant}</span>
              </div>
            )}
            {content.credits.license && (
              <div>
                <span className="text-[#8E867B] block">Lisensi Pelestarian:</span>
                <span className="font-medium text-[#292522]">{content.credits.license}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Related Content Recommendations */}
      {related.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-[#E5DED2]">
          <h2 className="font-serif font-bold text-xl text-[#292522]">
            Karya Budaya Terkait
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((item) => {
              const variant =
                item.category_id === 'gema-swara'
                  ? 'audio'
                  : item.category_id === 'gelanggang'
                  ? 'tutorial'
                  : 'landscape';
              return (
                <ContentCard
                  key={item.content_id}
                  item={item}
                  onClick={() => onSelectContent(item.slug)}
                  onPlayAudio={onPlayAudioTrack}
                  variant={variant}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
