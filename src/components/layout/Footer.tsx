import React from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { ShieldCheck, Mail } from 'lucide-react';
import { useSiteConfig } from '../../services/SiteConfigContext';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { config } = useSiteConfig();
  const f = config.footer;
  const brand = config.brand;

  return (
    <footer className="bg-[var(--color-charcoal,#292522)] text-[#F8F3E9] pt-14 pb-20 md:pb-12 border-t border-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-white/10">
          {/* Col 1: Identity */}
          <div className="md:col-span-1 space-y-4">
            <BrandLogo size="lg" light={true} showDescriptor={true} />
            <p className="text-xs text-[#D6CEBE] leading-relaxed">
              {f.brandMissionText}
            </p>
            {f.taglineQuote && (
              <p className="text-xs italic text-[var(--color-gold,#D4A373)]">
                "{f.taglineQuote}"
              </p>
            )}
          </div>

          {/* Col 2: Kategori Utama */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold,#D4A373)]">
              {f.culturalCategoriesHeading || 'Kategori Budaya'}
            </h4>
            <ul className="space-y-2 text-xs text-[#D6CEBE]">
              {config.categories.map((cat) => (
                <li key={cat.slug}>
                  <button
                    onClick={() => onNavigate(`/${cat.slug}`)}
                    className="hover:text-white transition-colors text-left"
                  >
                    {cat.displayName} ({cat.subtext.split(',')[0]})
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Edukasi & Tata Kelola */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold,#D4A373)]">
              {f.governanceHeading || 'Tentang & Tata Kelola'}
            </h4>
            <ul className="space-y-2 text-xs text-[#D6CEBE]">
              <li>
                <button
                  onClick={() => onNavigate('/tentang')}
                  className="hover:text-white transition-colors"
                >
                  Tentang {brand.appName}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/pedoman-konten')}
                  className="hover:text-white transition-colors"
                >
                  {f.guidelinesLinkText || 'Pedoman Konten Nusantara'}
                </button>
              </li>
              <li>
                <span className="text-white/60">Kurasi: {brand.editorialCurator}</span>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/admin/login')}
                  className="text-[var(--color-gold,#D4A373)] hover:underline flex items-center gap-1 mt-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Portal Kurator & Admin
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Hubungi Kami */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold,#D4A373)]">
              {f.contactHeading || 'Kontak Redaksi'}
            </h4>
            <p className="text-xs text-[#D6CEBE] leading-relaxed">
              {f.contactInvitationText}
            </p>
            <div className="flex items-center gap-2 text-xs text-[var(--color-gold,#D4A373)]">
              <Mail className="w-3.5 h-3.5" />
              <a href={`mailto:${brand.contactEmail}`} className="hover:underline">
                {brand.contactEmail}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8E867B]">
          <p>© {new Date().getFullYear()} {f.copyrightText}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/kebijakan-privasi')}
              className="hover:text-[#D6CEBE] transition-colors"
            >
              {f.privacyLinkText || 'Kebijakan Privasi'}
            </button>
            <span>·</span>
            <button
              onClick={() => onNavigate('/syarat-ketentuan')}
              className="hover:text-[#D6CEBE] transition-colors"
            >
              {f.termsLinkText || 'Syarat Penggunaan'}
            </button>
            <span>·</span>
            <span>{f.accessibilityNotice}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
