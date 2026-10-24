import React from 'react';
import { Home, Film, Headphones, Gamepad2, Calendar } from 'lucide-react';
import { useSiteConfig } from '../../services/SiteConfigContext';

interface MobileBottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPath,
  onNavigate
}) => {
  const { config } = useSiteConfig();

  // Find labels from dynamic configuration for the 4 official categories + home
  const getCategoryLabel = (slug: string, fallback: string) => {
    const cat = config.categories?.find((c) => c.slug === slug);
    return cat?.displayName || fallback;
  };

  const navItems = [
    {
      id: 'home',
      label: config.navigation?.find((n) => n.path === '/')?.label || 'Beranda',
      path: '/',
      icon: Home
    },
    {
      id: 'lalakon',
      label: getCategoryLabel('lalakon', 'Lalakon'),
      path: '/lalakon',
      icon: Film
    },
    {
      id: 'gema-swara',
      label: getCategoryLabel('gema-swara', 'Gema Swara'),
      path: '/gema-swara',
      icon: Headphones
    },
    {
      id: 'gelanggang',
      label: getCategoryLabel('gelanggang', 'Gelanggang'),
      path: '/gelanggang',
      icon: Gamepad2
    },
    {
      id: 'pagelaran',
      label: getCategoryLabel('pagelaran', 'Pagelaran'),
      path: '/pagelaran',
      icon: Calendar
    }
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-ivory,#F8F3E9)]/95 backdrop-blur-xl border-t border-[var(--color-border-sand,#E5DED2)] pb-safe shadow-lg select-none"
      aria-label="Navigasi Seluler ADARUPA"
    >
      <div className="grid grid-cols-5 items-center max-w-md mx-auto h-[54px] px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentPath === item.path ||
            (item.path !== '/' && currentPath.startsWith(item.path));

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.path)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
                isActive
                  ? 'text-[var(--color-maroon,#800020)] font-bold'
                  : 'text-[var(--color-muted-text,#6D675F)] hover:text-[var(--color-charcoal,#292522)]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'stroke-[2.5px] scale-105' : 'stroke-[1.8px]'
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--color-maroon,#800020)] rounded-full" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight leading-none truncate max-w-full px-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
