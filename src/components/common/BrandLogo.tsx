import React from 'react';
import { useSiteConfig } from '../../services/SiteConfigContext';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showDescriptor?: boolean;
  light?: boolean;
  overrideAppName?: string;
  overrideDescriptor?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showDescriptor = true,
  light = false,
  overrideAppName,
  overrideDescriptor
}) => {
  const { config } = useSiteConfig();

  const appName = overrideAppName || config.brand.appName;
  const descriptor = overrideDescriptor || config.brand.descriptor;
  const logoMode = config.brand.logoMode;
  const logoImageUrl = config.brand.logoImageUrl;

  const iconSize = size === 'sm' ? 26 : size === 'lg' ? 44 : 32;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const descSize = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-xs' : 'text-[11px]';

  // If custom logo image is provided and logoMode is 'image'
  if (logoMode === 'image' && logoImageUrl) {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <img
          src={logoImageUrl}
          alt={appName}
          referrerPolicy="no-referrer"
          className="object-contain rounded"
          style={{ width: iconSize, height: iconSize }}
        />
        <div className="flex flex-col leading-tight">
          <span
            className={`font-display font-bold tracking-wider ${textSize} ${
              light ? 'text-white' : 'text-[var(--color-maroon)]'
            }`}
            style={{ letterSpacing: '0.08em' }}
          >
            {appName}
          </span>
          {showDescriptor && (
            <span
              className={`font-sans tracking-wide uppercase font-medium ${descSize} ${
                light ? 'text-[var(--color-gold)]' : 'text-[var(--color-muted-text)]'
              }`}
            >
              {descriptor}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Cultural Gunungan Insignia with dynamic brand name and colors
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="relative shrink-0 flex items-center justify-center rounded-lg transition-transform hover:scale-105"
        style={{
          width: iconSize,
          height: iconSize,
          background: light
            ? 'rgba(255, 255, 255, 0.15)'
            : 'linear-gradient(145deg, var(--color-maroon, #800020) 0%, var(--color-maroon-deep, #590018) 100%)',
          boxShadow: light ? 'none' : '0 2px 8px rgba(128, 0, 32, 0.25)',
          border: light ? '1px solid rgba(212, 163, 115, 0.4)' : '1px solid rgba(212, 163, 115, 0.3)'
        }}
      >
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4"
        >
          {/* Stylized Gunungan silhouette */}
          <path
            d="M18 4L26 15C26 15 28 22 25 28C22 31 18 32 18 32C18 32 14 31 11 28C8 22 10 15 10 15L18 4Z"
            stroke="var(--color-gold, #D4A373)"
            strokeWidth="1.6"
            strokeLinejoin="round"
            fill={light ? 'var(--color-maroon, #800020)' : 'rgba(212, 163, 115, 0.12)'}
          />
          {/* Inner Tree of Life stem & branches */}
          <path
            d="M18 12V28M18 16L22 19M18 20L14 23M18 22L21 24"
            stroke="var(--color-gold, #D4A373)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle cx="18" cy="7" r="1.5" fill="var(--color-gold, #D4A373)" />
        </svg>
      </div>

      <div className="flex flex-col leading-tight">
        <span
          className={`font-display font-bold tracking-wider ${textSize} ${
            light ? 'text-white' : 'text-[var(--color-maroon)]'
          }`}
          style={{ letterSpacing: '0.08em' }}
        >
          {appName}
        </span>
        {showDescriptor && (
          <span
            className={`font-sans tracking-wide uppercase font-medium ${descSize} ${
              light ? 'text-[var(--color-gold)]' : 'text-[var(--color-muted-text)]'
            }`}
          >
            {descriptor}
          </span>
        )}
      </div>
    </div>
  );
};
