import React from 'react';
import { Film, Headphones, Gamepad2, Calendar, Sparkles } from 'lucide-react';
import { MainCategorySlug } from '../../types';

interface CulturalVisualPlaceholderProps {
  category: MainCategorySlug;
  title: string;
  region?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '3:2' | '2:3' | '3:4';
  className?: string;
  imageUrl?: string;
}

export const CulturalVisualPlaceholder: React.FC<CulturalVisualPlaceholderProps> = ({
  category,
  title,
  region,
  aspectRatio = '16:9',
  className = '',
  imageUrl
}) => {
  const [hasError, setHasError] = React.useState(false);

  const getAspectClass = () => {
    switch (aspectRatio) {
      case '1:1': return 'aspect-square';
      case '4:3': return 'aspect-[4/3]';
      case '3:2': return 'aspect-[3/2]';
      case '2:3': return 'aspect-[2/3]';
      case '3:4': return 'aspect-[3/4]';
      case '16:9':
      default:
        return 'aspect-video';
    }
  };

  const getTheme = () => {
    switch (category) {
      case 'lalakon':
        return {
          bg: 'linear-gradient(135deg, #590018 0%, #800020 60%, #3B0010 100%)',
          icon: Film,
          accent: '#D4A373',
          pattern: 'radial-gradient(circle at 80% 20%, rgba(212, 163, 115, 0.2) 0%, transparent 60%)'
        };
      case 'gema-swara':
        return {
          bg: 'linear-gradient(135deg, #1B3A2F 0%, #122820 70%, #0A1713 100%)',
          icon: Headphones,
          accent: '#E7C9A9',
          pattern: 'radial-gradient(circle at 20% 80%, rgba(212, 163, 115, 0.18) 0%, transparent 60%)'
        };
      case 'gelanggang':
        return {
          bg: 'linear-gradient(135deg, #C65D3A 0%, #8C391D 70%, #592312 100%)',
          icon: Gamepad2,
          accent: '#F8F3E9',
          pattern: 'radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.12) 0%, transparent 50%)'
        };
      case 'pagelaran':
      default:
        return {
          bg: 'linear-gradient(135deg, #800020 0%, #1B3A2F 100%)',
          icon: Calendar,
          accent: '#D4A373',
          pattern: 'radial-gradient(circle at 50% 30%, rgba(212, 163, 115, 0.22) 0%, transparent 70%)'
        };
    }
  };

  const theme = getTheme();
  const IconComponent = theme.icon;

  if (imageUrl && !hasError) {
    return (
      <div className={`relative overflow-hidden w-full ${getAspectClass()} ${className}`}>
        <img
          src={imageUrl}
          alt={title}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {/* Subtle scrim for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden flex flex-col justify-between p-4 sm:p-5 w-full select-none text-white ${getAspectClass()} ${className}`}
      style={{
        background: `${theme.pattern}, ${theme.bg}`
      }}
    >
      {/* Decorative Gunungan silhouette backdrop */}
      <svg
        viewBox="0 0 100 100"
        className="absolute -right-6 -bottom-6 w-36 h-36 opacity-10 pointer-events-none text-white"
        fill="currentColor"
      >
        <path d="M50 5 L75 35 C75 35 85 60 70 85 C60 95 50 98 50 98 C50 98 40 95 30 85 C15 60 25 35 25 35 Z" />
      </svg>

      {/* Top row: Category symbol & Region */}
      <div className="flex items-center justify-between z-10">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm"
          style={{ background: 'rgba(255, 255, 255, 0.15)', border: `1px solid ${theme.accent}40` }}
        >
          <IconComponent className="w-4 h-4" style={{ color: theme.accent }} />
        </div>
        {region && (
          <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded backdrop-blur-sm bg-black/25 text-white/90">
            {region}
          </span>
        )}
      </div>

      {/* Center / Bottom: Title typography */}
      <div className="z-10 mt-auto">
        <p className="font-serif text-sm sm:text-base font-semibold leading-snug line-clamp-2 drop-shadow-sm text-white">
          {title}
        </p>
      </div>
    </div>
  );
};
