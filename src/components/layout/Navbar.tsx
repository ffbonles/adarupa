import React from 'react';
import { Search, Shield, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useSiteConfig } from '../../services/SiteConfigContext';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  onOpenSearch,
  isAdminLoggedIn
}) => {
  const { config, isPreviewMode, setPreviewMode } = useSiteConfig();

  const navLinks = (config.navigation || [])
    .filter((item) => item.isVisible)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      {/* Draft Preview Indicator for Admins */}
      {isPreviewMode && (
        <div className="bg-amber-500 text-stone-900 px-4 py-1 text-[11px] font-semibold flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-900 animate-pulse" />
            <span>Mode Pratinjau Draf Aktif</span>
          </div>
          <button
            onClick={() => setPreviewMode(false)}
            className="px-2 py-0.5 bg-stone-900 text-white rounded text-[10px] hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Keluar Pratinjau
          </button>
        </div>
      )}

      {/* Compact Top App Bar */}
      <header className="sticky top-0 z-30 bg-[var(--color-ivory,#F8F3E9)]/90 backdrop-blur-xl border-b border-[var(--color-border-sand,#E5DED2)]/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between gap-4">
          {/* Brand Anchor */}
          <button
            onClick={() => onNavigate('/')}
            className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-maroon,#800020)] rounded-lg py-1 transition-transform active:scale-95 cursor-pointer"
            aria-label={`Beranda ${config.brand.appName}`}
          >
            <div className="block sm:hidden">
              <BrandLogo size="sm" showDescriptor={false} />
            </div>
            <div className="hidden sm:block">
              <BrandLogo size="md" showDescriptor={true} />
            </div>
          </button>

          {/* Desktop Nav Links (Restrained, no pills) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive =
                currentPath === link.path ||
                (link.path !== '/' && currentPath.startsWith(link.path));
              return (
                <button
                  key={link.id || link.path}
                  onClick={() => onNavigate(link.path)}
                  className={`py-1 relative transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[var(--color-maroon,#800020)] font-bold'
                      : 'text-[var(--color-muted-text,#6D675F)] hover:text-[var(--color-charcoal,#292522)]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-maroon,#800020)] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Zone: Search & Admin Portal */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search Action */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 text-xs text-[var(--color-muted-text,#6D675F)] bg-white/80 hover:bg-white border border-[var(--color-border-sand,#E5DED2)] rounded-full sm:rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
              aria-label="Cari khazanah kebudayaan"
            >
              <Search className="w-4 h-4 text-[var(--color-maroon,#800020)]" />
              <span className="hidden sm:inline whitespace-nowrap">
                {config.uiStrings.searchButtonLabel || 'Cari Budaya...'}
              </span>
              <kbd className="hidden lg:inline text-[10px] bg-[#F8F3E9] px-1.5 py-0.5 rounded text-[var(--color-muted-text)] font-mono border border-[var(--color-border-sand)]">
                ⌘K
              </kbd>
            </button>

            {/* Admin Portal Quick Icon/Button */}
            <button
              onClick={() => onNavigate(isAdminLoggedIn ? '/admin/dashboard' : '/admin/login')}
              className={`p-2 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-full sm:rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                isAdminLoggedIn
                  ? 'bg-[var(--color-forest,#1B3A2F)] text-white shadow-xs'
                  : 'text-[var(--color-maroon,#800020)] hover:bg-[var(--color-maroon,#800020)]/10 border border-[var(--color-maroon,#800020)]/30'
              }`}
              title={isAdminLoggedIn ? 'Dasbor Kurator' : 'Login Admin'}
            >
              {isAdminLoggedIn ? (
                <ShieldCheck className="w-4 h-4 text-[var(--color-gold,#D4A373)]" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isAdminLoggedIn ? 'Dasbor' : 'Kurator'}
              </span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
