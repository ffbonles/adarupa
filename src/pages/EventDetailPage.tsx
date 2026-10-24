import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Building,
  ExternalLink,
  Share2,
  CalendarPlus,
  CheckCircle2,
  Check
} from 'lucide-react';
import { CulturalEvent } from '../types';
import { api } from '../services/apiClient';
import { CulturalVisualPlaceholder } from '../components/common/CulturalVisualPlaceholder';

interface EventDetailPageProps {
  slug: string;
  onBack: () => void;
}

export const EventDetailPage: React.FC<EventDetailPageProps> = ({ slug, onBack }) => {
  const [event, setEvent] = useState<CulturalEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      setIsLoading(true);
      try {
        const res = await api.getEventBySlug(slug);
        setEvent(res.data || null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadEvent();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-2 border-[#800020] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#6D675F]">Memuat jadwal pagelaran nusantara...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif font-bold text-2xl text-[#292522] mb-2">Pagelaran Tidak Ditemukan</h2>
        <p className="text-xs text-[#6D675F] mb-6">Agenda perhelatan yang Anda cari tidak tersedia dalam sistem.</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-[#800020] text-white text-xs font-semibold rounded-lg hover:bg-[#590018] inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Pagelaran
        </button>
      </div>
    );
  }

  const startDate = new Date(event.start_datetime);
  const endDate = new Date(event.end_datetime);

  const formatLongDate = (d: Date) => {
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  // Google Calendar URL generator
  const getGoogleCalendarUrl = () => {
    const formatGCalDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const startStr = formatGCalDate(startDate);
    const endStr = formatGCalDate(endDate);
    const details = encodeURIComponent(`${event.description}\n\nSumber Resmi: ${event.official_source_url || 'ADARUPA'}`);
    const location = encodeURIComponent(`${event.venue}, ${event.address}`);
    const text = encodeURIComponent(event.title);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
  };

  // iCalendar (.ics) File Export
  const downloadIcsFile = () => {
    const formatIcsDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ADARUPA//Jelajah Budaya Nusantara//ID',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${event.event_id}@adarupa.id`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(startDate)}`,
      `DTEND:${formatIcsDate(endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${event.venue}, ${event.address}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.slug}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6D675F] hover:text-[#800020] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Agenda Pagelaran</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5DED2] rounded-lg text-xs font-medium text-[#6D675F] hover:text-[#292522] transition-colors"
        >
          {copiedShare ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Tautan Disalin!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-[#800020]" />
              <span>Bagikan Pagelaran</span>
            </>
          )}
        </button>
      </div>

      {/* Hero Poster Banner */}
      <div className="rounded-2xl overflow-hidden border border-[#E5DED2] shadow-md bg-[#292522]">
        <CulturalVisualPlaceholder
          category="pagelaran"
          title={event.title}
          region={event.province}
          aspectRatio="16:9"
          imageUrl={event.poster_url}
        />
      </div>

      {/* Main Event Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 2 Cols: Description & Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#6D675F] font-medium">
              <span className="text-[#800020] font-semibold">{event.category}</span>
              <span>·</span>
              <span>{event.city}, {event.province}</span>
              {event.verification_status === 'verified' && (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Terverifikasi Kurator</span>
                  </span>
                </>
              )}
            </div>

            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#292522]">
              {event.title}
            </h1>
          </div>

          <div className="prose text-sm text-[#292522] leading-relaxed space-y-3 font-sans">
            <p>{event.description}</p>
          </div>

          {/* Organizer Info */}
          <div className="p-4 rounded-xl bg-white border border-[#E5DED2] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#800020]/10 text-[#800020] flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-[#8E867B] block">Penyelenggara Resmi:</span>
              <span className="text-xs font-bold text-[#292522]">{event.organizer}</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Practical Info & Calendar Export */}
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-white border border-[#E5DED2] shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-sm text-[#800020] uppercase tracking-wider pb-2 border-b border-[#F1ECE0]">
              Waktu & Lokasi
            </h3>

            <div className="space-y-3 text-xs text-[#292522]">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-[#D4A373] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">{formatLongDate(startDate)}</span>
                  <span className="text-[#6D675F]">sampai {formatLongDate(endDate)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#D4A373] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Pukul:</span>
                  <span className="text-[#6D675F]">{formatTime(startDate)} — {formatTime(endDate)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4A373] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">{event.venue}</span>
                  <span className="text-[#6D675F] leading-tight block mt-0.5">{event.address}</span>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${event.venue} ${event.address}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#800020] hover:underline inline-flex items-center gap-1 mt-1 font-medium"
                  >
                    Buka Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Action Buttons: Add to Calendar */}
            <div className="pt-3 border-t border-[#F1ECE0] space-y-2">
              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 rounded-lg bg-[#800020] hover:bg-[#590018] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Simpan ke Google Kalender</span>
              </a>

              <button
                onClick={downloadIcsFile}
                className="w-full py-2 px-3 rounded-lg bg-[#F8F3E9] hover:bg-[#F1ECE0] text-[#292522] border border-[#E5DED2] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Unduh Berkas (.ics) Kalender</span>
              </button>
            </div>

            {/* External Registration / Source */}
            {(event.registration_url || event.official_source_url) && (
              <div className="pt-3 border-t border-[#F1ECE0] space-y-2 text-xs">
                {event.registration_url && (
                  <a
                    href={event.registration_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-lg bg-[#1B3A2F] text-white hover:bg-[#122820] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Registrasi / Tiket Resmi</span>
                  </a>
                )}
                {event.official_source_url && (
                  <a
                    href={event.official_source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#6D675F] hover:text-[#800020] hover:underline flex items-center justify-center gap-1 text-[11px] pt-1"
                  >
                    <span>Laman Informasi Resmi</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
