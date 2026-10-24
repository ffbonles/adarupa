import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { LalakonPage } from './pages/LalakonPage';
import { GemaSwaraPage } from './pages/GemaSwaraPage';
import { GelanggangPage } from './pages/GelanggangPage';
import { PagelaranPage } from './pages/PagelaranPage';
import { ContentDetailPage } from './pages/ContentDetailPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { StaticContentPage, StaticPageKey } from './pages/StaticContentPage';
import { AudioPlayer, AudioTrackInfo } from './components/media/AudioPlayer';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { api } from './services/apiClient';
import { SiteConfigProvider } from './services/SiteConfigContext';
import { ContentItem } from './types';

const staticKeyToPath: Record<StaticPageKey, string> = {
  about: '/tentang',
  contentGuidelines: '/pedoman-konten',
  privacyPolicy: '/kebijakan-privasi',
  termsOfService: '/syarat-ketentuan'
};

function AppInner() {
  // Simple browser-history-compatible router state
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [currentAudioTrack, setCurrentAudioTrack] = useState<AudioTrackInfo | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(Boolean(api.getActiveSession()));

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setIsAdminLoggedIn(Boolean(api.getActiveSession()));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    setIsAdminLoggedIn(Boolean(api.getActiveSession()));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayAudio = (item: ContentItem, episodeList?: ContentItem[]) => {
    setCurrentAudioTrack({
      content: item,
      episodeList,
      onSelectEpisode: (ep) => handlePlayAudio(ep, episodeList)
    });
  };

  // Determine current route
  const renderCurrentView = () => {
    // Content Detail: /konten/:slug
    if (currentPath.startsWith('/konten/')) {
      const slug = currentPath.replace('/konten/', '');
      return (
        <ContentDetailPage
          slug={slug}
          onBack={() => window.history.length > 1 ? window.history.back() : navigate('/')}
          onSelectContent={(newSlug) => navigate(`/konten/${newSlug}`)}
          onPlayAudioTrack={handlePlayAudio}
        />
      );
    }

    // Event Detail: /pagelaran/:slug (or event details)
    if (currentPath.startsWith('/pagelaran/') && currentPath !== '/pagelaran') {
      const slug = currentPath.replace('/pagelaran/', '');
      return (
        <EventDetailPage
          slug={slug}
          onBack={() => navigate('/pagelaran')}
        />
      );
    }

    // Static CMS Pages
    if (currentPath === '/tentang') {
      return (
        <StaticContentPage
          pageKey="about"
          onNavigateHome={() => navigate('/')}
          onNavigatePage={(k) => navigate(staticKeyToPath[k])}
        />
      );
    }
    if (currentPath === '/pedoman-konten') {
      return (
        <StaticContentPage
          pageKey="contentGuidelines"
          onNavigateHome={() => navigate('/')}
          onNavigatePage={(k) => navigate(staticKeyToPath[k])}
        />
      );
    }
    if (currentPath === '/kebijakan-privasi') {
      return (
        <StaticContentPage
          pageKey="privacyPolicy"
          onNavigateHome={() => navigate('/')}
          onNavigatePage={(k) => navigate(staticKeyToPath[k])}
        />
      );
    }
    if (currentPath === '/syarat-ketentuan') {
      return (
        <StaticContentPage
          pageKey="termsOfService"
          onNavigateHome={() => navigate('/')}
          onNavigatePage={(k) => navigate(staticKeyToPath[k])}
        />
      );
    }

    // Admin Login: /admin/login
    if (currentPath === '/admin/login') {
      return (
        <AdminLoginPage
          onSuccess={() => {
            setIsAdminLoggedIn(true);
            navigate('/admin/dashboard');
          }}
          onBackToHome={() => navigate('/')}
        />
      );
    }

    // Admin Dashboard & sub-routes: /admin/*
    if (currentPath.startsWith('/admin')) {
      if (!isAdminLoggedIn) {
        return (
          <AdminLoginPage
            onSuccess={() => {
              setIsAdminLoggedIn(true);
              navigate('/admin/dashboard');
            }}
            onBackToHome={() => navigate('/')}
          />
        );
      }
      return (
        <AdminDashboardPage
          onLogout={() => {
            api.logoutAdmin();
            setIsAdminLoggedIn(false);
            navigate('/admin/login');
          }}
          onViewPublicSite={() => navigate('/')}
        />
      );
    }

    // Main Category Pages
    switch (currentPath) {
      case '/lalakon':
        return (
          <LalakonPage
            onSelectContent={(slug) => navigate(`/konten/${slug}`)}
          />
        );
      case '/gema-swara':
        return (
          <GemaSwaraPage
            onSelectContent={(slug) => navigate(`/konten/${slug}`)}
            onPlayAudioTrack={handlePlayAudio}
          />
        );
      case '/gelanggang':
        return (
          <GelanggangPage
            onSelectContent={(slug) => navigate(`/konten/${slug}`)}
          />
        );
      case '/pagelaran':
        return (
          <PagelaranPage
            onSelectEvent={(slug) => navigate(`/pagelaran/${slug}`)}
          />
        );
      case '/':
      default:
        return (
          <HomePage
            onNavigate={navigate}
            onSelectContent={(slug) => navigate(`/konten/${slug}`)}
            onSelectEvent={(slug) => navigate(`/pagelaran/${slug}`)}
            onPlayAudioTrack={handlePlayAudio}
          />
        );
    }
  };

  const isAdminView = currentPath.startsWith('/admin') && isAdminLoggedIn;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-ivory,#F8F3E9)] text-[var(--color-charcoal,#292522)]">
      {/* Top Navbar (hidden on admin dashboard for focused workspace) */}
      {!isAdminView && (
        <Navbar
          currentPath={currentPath}
          onNavigate={navigate}
          onOpenSearch={() => setSearchModalOpen(true)}
          isAdminLoggedIn={isAdminLoggedIn}
        />
      )}

      {/* Main Page Canvas with dynamic padding to prevent content from hiding beneath bottom nav or mini player */}
      <main className={`flex-1 ${!isAdminView ? (currentAudioTrack ? 'pb-36 sm:pb-40' : 'pb-20 sm:pb-24') : ''}`}>
        {renderCurrentView()}
      </main>

      {/* Persistent Audio Player across all routes */}
      <AudioPlayer
        currentTrack={currentAudioTrack}
        onClose={() => setCurrentAudioTrack(null)}
      />

      {/* Mobile Bottom Thumb Navigation */}
      {!isAdminView && (
        <MobileBottomNav
          currentPath={currentPath}
          onNavigate={navigate}
        />
      )}

      {/* Public Footer */}
      {!isAdminView && <Footer onNavigate={navigate} />}

      {/* Global Unified Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectContent={(slug) => navigate(`/konten/${slug}`)}
        onSelectEvent={(slug) => navigate(`/pagelaran/${slug}`)}
      />
    </div>
  );
}

export function App() {
  return (
    <SiteConfigProvider>
      <AppInner />
    </SiteConfigProvider>
  );
}

export default App;
