import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SiteConfig } from '../types';
import { DEFAULT_SITE_CONFIG } from '../data/culturalData';
import { api } from './apiClient';

interface SiteConfigContextType {
  config: SiteConfig;
  draftConfig: SiteConfig | null;
  isPreviewMode: boolean;
  setPreviewMode: (enabled: boolean) => void;
  isLoading: boolean;
  error: string | null;
  refreshConfig: () => Promise<void>;
  updateDraftInMemory: (newDraft: SiteConfig) => void;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export const SiteConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [draftConfig, setDraftConfig] = useState<SiteConfig | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const applyThemeToDocument = useCallback((theme: SiteConfig['theme'], brand: SiteConfig['brand'], seo: SiteConfig['seo']) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.style.setProperty('--color-maroon', theme.primaryMaroon);
    root.style.setProperty('--color-maroon-deep', theme.deepMaroon);
    root.style.setProperty('--color-forest', theme.forestGreen);
    root.style.setProperty('--color-gold', theme.warmGold);
    root.style.setProperty('--color-ivory', theme.ivoryBackground);
    root.style.setProperty('--color-terracotta', theme.terracottaAccent);
    root.style.setProperty('--color-charcoal', theme.primaryText);
    root.style.setProperty('--color-muted-text', theme.secondaryText);
    root.style.setProperty('--color-border-sand', theme.borderColor);

    // Dynamic Title & SEO
    if (seo?.metaTitle || brand?.appName) {
      document.title = seo?.metaTitle || `${brand.appName} — ${brand.descriptor}`;
    }

    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', seo?.metaDescription || brand?.brandDescription);

    // Favicon update if configured
    if (brand?.faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        document.head.appendChild(link);
      }
      link.href = brand.faviconUrl;
    }
  }, []);

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getPublicSiteConfig();
      if (res.success && res.data) {
        setConfig(res.data);
        if (!isPreviewMode) {
          applyThemeToDocument(res.data.theme, res.data.brand, res.data.seo);
        }
      } else {
        setError(res.error?.message || 'Gagal memuat konfigurasi situs');
      }

      // If user is admin, also fetch draft configuration
      if (api.getActiveSession()) {
        const draftRes = await api.getDraftSiteConfig();
        if (draftRes.success && draftRes.data) {
          setDraftConfig(draftRes.data);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Koneksi ke layanan konfigurasi terputus');
    } finally {
      setIsLoading(false);
    }
  }, [isPreviewMode, applyThemeToDocument]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Apply preview theme when preview mode is toggled
  useEffect(() => {
    if (isPreviewMode && draftConfig) {
      applyThemeToDocument(draftConfig.theme, draftConfig.brand, draftConfig.seo);
    } else if (config) {
      applyThemeToDocument(config.theme, config.brand, config.seo);
    }
  }, [isPreviewMode, draftConfig, config, applyThemeToDocument]);

  const updateDraftInMemory = (newDraft: SiteConfig) => {
    setDraftConfig(newDraft);
    if (isPreviewMode) {
      applyThemeToDocument(newDraft.theme, newDraft.brand, newDraft.seo);
    }
  };

  const activeConfig = (isPreviewMode && draftConfig) ? draftConfig : config;

  return (
    <SiteConfigContext.Provider
      value={{
        config: activeConfig,
        draftConfig,
        isPreviewMode,
        setPreviewMode: setIsPreviewMode,
        isLoading,
        error,
        refreshConfig: fetchConfig,
        updateDraftInMemory
      }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = (): SiteConfigContextType => {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfig harus digunakan di dalam SiteConfigProvider');
  }
  return context;
};
