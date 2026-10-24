import React from 'react';
import { useSiteConfig } from '../services/SiteConfigContext';
import { BookOpen, Shield, FileText, ArrowLeft, Calendar, Sparkles } from 'lucide-react';

export type StaticPageKey = 'about' | 'contentGuidelines' | 'privacyPolicy' | 'termsOfService';

interface StaticContentPageProps {
  pageKey: StaticPageKey;
  onNavigateHome: () => void;
  onNavigatePage?: (key: StaticPageKey) => void;
}

export const StaticContentPage: React.FC<StaticContentPageProps> = ({
  pageKey,
  onNavigateHome,
  onNavigatePage
}) => {
  const { config } = useSiteConfig();

  const getPageData = () => {
    switch (pageKey) {
      case 'about':
        return {
          title: config.staticPages.aboutTitle || 'Tentang ADARUPA',
          subtitle: config.staticPages.aboutSubtitle || 'Merawat Akar Peradaban Melalui Medium Digital',
          content: config.staticPages.aboutBody
        };
      case 'contentGuidelines':
        return {
          title: config.staticPages.guidelinesTitle || 'Pedoman Konten Nusantara',
          subtitle: 'Panduan Etika, Verifikasi Adat, dan Keotentikan Budaya',
          content: config.staticPages.guidelinesBody
        };
      case 'privacyPolicy':
        return {
          title: config.staticPages.privacyPolicyTitle || 'Kebijakan Privasi',
          subtitle: 'Komitmen Perlindungan Privasi dan Integritas Pengunjung',
          content: config.staticPages.privacyPolicyBody
        };
      case 'termsOfService':
        return {
          title: config.staticPages.termsOfUseTitle || 'Syarat Ketentuan Penggunaan',
          subtitle: 'Ketentuan Lisensi Kebudayaan dan Pemanfaatan Terbuka',
          content: config.staticPages.termsOfUseBody
        };
    }
  };

  const pageData = getPageData();

  const getPageIcon = (key: StaticPageKey) => {
    switch (key) {
      case 'about':
        return <BookOpen className="w-5 h-5 text-[var(--color-gold,#D4A373)]" />;
      case 'contentGuidelines':
        return <Sparkles className="w-5 h-5 text-[var(--color-gold,#D4A373)]" />;
      case 'privacyPolicy':
        return <Shield className="w-5 h-5 text-[var(--color-gold,#D4A373)]" />;
      case 'termsOfService':
        return <FileText className="w-5 h-5 text-[var(--color-gold,#D4A373)]" />;
    }
  };

  const navLinks: { key: StaticPageKey; label: string }[] = [
    { key: 'about', label: config.staticPages.aboutTitle || 'Tentang Kami' },
    { key: 'contentGuidelines', label: config.staticPages.guidelinesTitle || 'Pedoman Kurasi' },
    { key: 'privacyPolicy', label: config.staticPages.privacyPolicyTitle || 'Kebijakan Privasi' },
    { key: 'termsOfService', label: config.staticPages.termsOfUseTitle || 'Syarat Ketentuan' }
  ];

  // Helper to render paragraphs
  const renderContent = (content: string) => {
    if (!content) return null;
    const paragraphs = content.split('\n\n');
    return paragraphs.map((p, idx) => {
      if (p.startsWith('### ')) {
        return (
          <h3 key={idx} className="font-serif font-bold text-lg text-[var(--color-charcoal,#292522)] mt-6 mb-2">
            {p.replace('### ', '')}
          </h3>
        );
      }
      if (p.startsWith('## ')) {
        return (
          <h2 key={idx} className="font-serif font-bold text-xl text-[var(--color-maroon,#800020)] mt-8 mb-3 border-b border-[#E5DED2] pb-2">
            {p.replace('## ', '')}
          </h2>
        );
      }
      if (p.startsWith('# ')) {
        return (
          <h1 key={idx} className="font-serif font-bold text-2xl text-[var(--color-maroon,#800020)] mt-8 mb-3">
            {p.replace('# ', '')}
          </h1>
        );
      }
      return (
        <p key={idx} className="text-sm sm:text-base text-[var(--color-charcoal,#292522)] leading-relaxed mb-4">
          {p}
        </p>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-maroon,#800020)] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>
      </div>

      {/* Main Header */}
      <header className="p-8 rounded-2xl bg-gradient-to-r from-[var(--color-maroon,#800020)] via-[var(--color-maroon-deep,#590018)] to-[var(--color-forest,#1B3A2F)] text-white shadow-lg relative overflow-hidden">
        {config.theme.enableBatikPatterns && (
          <div className="absolute inset-0 batik-pattern opacity-10 pointer-events-none" />
        )}
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[var(--color-gold,#D4A373)] text-xs font-medium uppercase tracking-wider">
            {getPageIcon(pageKey)}
            <span>Halaman Resmi {config.brand.appName}</span>
          </div>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-white">
            {pageData.title}
          </h1>
          {pageData.subtitle && (
            <p className="text-sm sm:text-base text-[#D6CEBE] max-w-2xl leading-relaxed">
              {pageData.subtitle}
            </p>
          )}
          <div className="pt-2 flex items-center gap-1.5 text-xs text-[#E5DED2]/80">
            <Calendar className="w-3.5 h-3.5" />
            <span>Pembaruan sistem: Versi {config.version} ({config.updatedAt ? new Date(config.updatedAt).toLocaleDateString('id-ID') : 'Terbaru'})</span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs between Static Pages */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E5DED2] pb-3">
        {navLinks.map((link) => (
          <button
            key={link.key}
            onClick={() => onNavigatePage && onNavigatePage(link.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              pageKey === link.key
                ? 'bg-[var(--color-maroon,#800020)] text-white shadow-xs'
                : 'bg-white text-[var(--color-muted-text,#5E564F)] hover:bg-[#F0EBE1] border border-[#E5DED2]'
            }`}
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* Editorial Article Body */}
      <article className="bg-white rounded-2xl p-6 sm:p-10 border border-[#E5DED2] shadow-sm">
        <div className="prose max-w-none">
          {pageData.content ? (
            renderContent(pageData.content)
          ) : (
            <p className="text-sm text-[var(--color-muted-text,#8E867B)] italic">
              Konten halaman ini belum tersedia atau sedang diperbarui oleh kurator.
            </p>
          )}
        </div>

        {/* Brand Signoff */}
        <div className="mt-12 pt-6 border-t border-[#E5DED2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[var(--color-muted-text,#8E867B)]">
          <div>
            <p className="font-semibold text-[var(--color-maroon,#800020)]">{config.brand.appName} — {config.brand.descriptor}</p>
            <p>{config.brand.tagline}</p>
          </div>
          <div>
            <p>Kontak: <a href={`mailto:${config.brand.contactEmail}`} className="underline text-[var(--color-maroon,#800020)]">{config.brand.contactEmail}</a></p>
          </div>
        </div>
      </article>
    </div>
  );
};
