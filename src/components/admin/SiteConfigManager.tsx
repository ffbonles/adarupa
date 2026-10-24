import React, { useState, useEffect } from 'react';
import {
  Palette,
  Image as ImageIcon,
  Home,
  Navigation,
  FolderTree,
  FileText,
  Type,
  Phone,
  Eye,
  History,
  Save,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Upload,
  ChevronRight,
  Smartphone,
  Monitor,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Lock,
  RefreshCw,
  Sparkles,
  HelpCircle,
  Check
} from 'lucide-react';
import { useSiteConfig } from '../../services/SiteConfigContext';
import { api } from '../../services/apiClient';
import {
  SiteConfig,
  ConfigHistorySnapshot,
  MediaAsset,
  NavLinkItem,
  CategoryDisplayConfig
} from '../../types';

interface SiteConfigManagerProps {
  onClose?: () => void;
  onPreviewPublicSite?: () => void;
}

type ConfigSection =
  | 'brand'
  | 'theme'
  | 'hero'
  | 'navigation'
  | 'categories'
  | 'staticPages'
  | 'uiStrings'
  | 'footer'
  | 'preview_publish'
  | 'history';

type StaticPageTab = 'about' | 'guidelines' | 'privacy' | 'terms';

export const SiteConfigManager: React.FC<SiteConfigManagerProps> = ({
  onClose,
  onPreviewPublicSite
}) => {
  const { config, draftConfig, isPreviewMode, setPreviewMode, refreshConfig, updateDraftInMemory } = useSiteConfig();

  const [activeSection, setActiveSection] = useState<ConfigSection>('brand');
  const [formData, setFormData] = useState<SiteConfig>(draftConfig || config);
  const [historyList, setHistoryList] = useState<ConfigHistorySnapshot[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
  const [drivePickerTarget, setDrivePickerTarget] = useState<'logo' | 'alternateLogo' | 'favicon' | 'category' | null>(null);
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('lalakon');
  const [activeStaticTab, setActiveStaticTab] = useState<StaticPageTab>('about');

  // Preview simulator state
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // UI feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [changesSummary, setChangesSummary] = useState<string>('Pembaruan pengaturan tampilan situs');
  const [isConfirmPublishOpen, setIsConfirmPublishOpen] = useState(false);

  // Sync draft data when loaded
  useEffect(() => {
    if (draftConfig) {
      setFormData(draftConfig);
    } else if (config) {
      setFormData(config);
    }
  }, [draftConfig, config]);

  // Load history and media assets
  useEffect(() => {
    loadHistoryAndMedia();
  }, []);

  async function loadHistoryAndMedia() {
    try {
      const [histRes, mediaRes] = await Promise.all([
        api.getSiteConfigHistory(),
        api.getMediaAssets()
      ]);
      if (histRes.success && histRes.data) {
        setHistoryList(histRes.data);
      }
      if (mediaRes.success && mediaRes.data) {
        setMediaAssets(mediaRes.data);
      }
    } catch (err) {
      console.error('Failed to load history or media assets', err);
    }
  }

  const showStatus = (type: 'success' | 'error' | 'info', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  // Handle generic nested field update
  const updateField = (path: string, value: any) => {
    setFormData((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let current = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      // Also notify context draft in memory for live preview
      updateDraftInMemory(updated);
      return updated;
    });
  };

  // Save Draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const res = await api.saveDraftSiteConfig(formData);
      if (res.success) {
        showStatus('success', 'Draf konfigurasi berhasil disimpan ke sistem.');
        await refreshConfig();
      } else {
        showStatus('error', res.error?.message || 'Gagal menyimpan draf konfigurasi.');
      }
    } catch (err: any) {
      showStatus('error', err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setIsSaving(false);
    }
  };

  // Publish Draft
  const handlePublish = async () => {
    setIsPublishing(true);
    setIsConfirmPublishOpen(false);
    try {
      const res = await api.publishSiteConfig(formData, changesSummary);
      if (res.success) {
        showStatus('success', 'Konfigurasi situs berhasil dipublikasikan dan aktif untuk seluruh pengunjung!');
        setPreviewMode(false);
        await refreshConfig();
        await loadHistoryAndMedia();
      } else {
        showStatus('error', res.error?.message || 'Gagal mempublikasikan konfigurasi.');
      }
    } catch (err: any) {
      showStatus('error', err.message || 'Gagal mempublikasikan konfigurasi.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Rollback to Snapshot
  const handleRollback = async (historyId: string) => {
    if (!window.confirm(`Konfirmasi pemulihan konfigurasi ke versi arsip ini? Pengaturan publik akan langsung dipulihkan.`)) {
      return;
    }
    setIsSaving(true);
    try {
      const res = await api.rollbackSiteConfig(historyId);
      if (res.success && res.data) {
        setFormData(res.data.publishedConfig);
        showStatus('success', `Berhasil memulihkan konfigurasi situs ke versi ${res.data.version}.`);
        await refreshConfig();
        await loadHistoryAndMedia();
      } else {
        showStatus('error', res.error?.message || 'Gagal memulihkan versi konfigurasi.');
      }
    } catch (err: any) {
      showStatus('error', err.message || 'Terjadi kesalahan sistem rollback.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to apply asset from Drive picker
  const handleSelectDriveAsset = (asset: MediaAsset) => {
    const driveUrl = `https://drive.google.com/uc?export=view&id=${asset.drive_file_id}`;
    if (drivePickerTarget === 'logo') {
      updateField('brand.logoImageUrl', driveUrl);
      updateField('brand.logoDriveFileId', asset.drive_file_id);
      updateField('brand.logoMode', 'image');
    } else if (drivePickerTarget === 'alternateLogo') {
      updateField('brand.alternateLogoUrl', driveUrl);
    } else if (drivePickerTarget === 'favicon') {
      updateField('brand.faviconUrl', driveUrl);
    } else if (drivePickerTarget === 'category') {
      const updatedCategories = formData.categories.map((c) =>
        c.slug === activeCategorySlug ? { ...c, coverImageUrl: driveUrl } : c
      );
      updateField('categories', updatedCategories);
    }
    setIsDrivePickerOpen(false);
    setDrivePickerTarget(null);
    showStatus('info', `Aset Google Drive "${asset.file_name}" berhasil dipasang.`);
  };

  // Navigation handlers
  const handleMoveNavItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...formData.navigation];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    // re-assign order
    newItems.forEach((item, idx) => (item.order = idx + 1));
    updateField('navigation', newItems);
  };

  const handleToggleNavVisibility = (index: number) => {
    const newItems = [...formData.navigation];
    newItems[index].isVisible = !newItems[index].isVisible;
    updateField('navigation', newItems);
  };

  const handleUpdateNavItem = (index: number, key: keyof NavLinkItem, val: any) => {
    const newItems = [...formData.navigation];
    newItems[index] = { ...newItems[index], [key]: val };
    updateField('navigation', newItems);
  };

  const handleAddNavItem = () => {
    const newItem: NavLinkItem = {
      id: `nav-${Date.now()}`,
      label: 'Tautan Baru',
      path: '/koleksi',
      isVisible: true,
      order: formData.navigation.length + 1
    };
    updateField('navigation', [...formData.navigation, newItem]);
  };

  const handleDeleteNavItem = (index: number) => {
    const newItems = formData.navigation.filter((_, i) => i !== index);
    newItems.forEach((item, idx) => (item.order = idx + 1));
    updateField('navigation', newItems);
  };

  // Sidebar menus (all 10 required items)
  const menuSections = [
    { id: 'brand', label: '1. Identitas Merek', icon: ImageIcon, desc: 'Logo, nama aplikasi, kurator & deskriptor' },
    { id: 'theme', label: '2. Tema dan Warna', icon: Palette, desc: 'Palet maroon nusantara, font & aksen batik' },
    { id: 'hero', label: '3. Beranda', icon: Home, desc: 'Teks hero, banner, ajakan bertindak & judul seksi' },
    { id: 'navigation', label: '4. Navigasi', icon: Navigation, desc: 'Menu utama, urutan & visibilitas bilah atas' },
    { id: 'categories', label: '5. Kategori & Subkategori', icon: FolderTree, desc: 'Lalakon, Gema Swara, Gelanggang, Pagelaran' },
    { id: 'staticPages', label: '6. Halaman Statis', icon: FileText, desc: 'Tentang, Pedoman Konten, Privasi & Syarat' },
    { id: 'uiStrings', label: '7. Teks Antarmuka', icon: Type, desc: 'Pencarian, tombol aksi, empty-state & dialog' },
    { id: 'footer', label: '8. Footer & Kontak', icon: Phone, desc: 'Kutipan budaya, kontak kurasi, hak cipta' },
    { id: 'preview_publish', label: '9. Pratinjau & Publikasi', icon: Eye, desc: 'Simulasi desktop/mobile, diff & publish live' },
    { id: 'history', label: '10. Riwayat Perubahan', icon: History, desc: 'Snapshot log versi & fitur rollback instan' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E5DED2] shadow-sm overflow-hidden flex flex-col min-h-[780px]">
      {/* Top Header Bar */}
      <div className="px-6 py-4 bg-[#F8F3E9] border-b border-[#E5DED2] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-maroon,#800020)] to-[var(--color-maroon-deep,#590018)] text-white flex items-center justify-center shadow-xs">
            <Palette className="w-5 h-5 text-[var(--color-gold,#D4A373)]" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-[#292522]">
              Pengaturan Tampilan & Konten Website
            </h2>
            <p className="text-xs text-[#6D675F]">
              Kelola identitas, palet warna, tajuk redaksi, dan seluruh teks antarmuka dengan prinsip <span className="font-semibold text-[#800020]">Zero Hardcoded Branding</span>.
            </p>
          </div>
        </div>

        {/* Global Save / Preview Actions */}
        <div className="flex items-center gap-2">
          {/* Live Preview Toggle */}
          <button
            type="button"
            onClick={() => setPreviewMode(!isPreviewMode)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              isPreviewMode
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-[#5E564F] hover:bg-[#F1ECE0] border-[#E5DED2]'
            }`}
          >
            <Eye className="w-4 h-4 text-[#800020]" />
            <span>{isPreviewMode ? 'Mode Pratinjau: Aktif' : 'Aktifkan Pratinjau'}</span>
          </button>

          {/* Save Draft */}
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-[#292522] hover:bg-[#F1ECE0] border border-[#E5DED2] flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#800020]" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Draf'}</span>
          </button>

          {/* Publish */}
          <button
            type="button"
            onClick={() => setIsConfirmPublishOpen(true)}
            disabled={isPublishing}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--color-maroon,#800020)] hover:bg-[var(--color-maroon-deep,#590018)] text-white shadow-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-[var(--color-gold,#D4A373)]" />
            <span>{isPublishing ? 'Mempublikasikan...' : 'Publikasikan ke Website'}</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`px-6 py-2.5 text-xs font-medium flex items-center justify-between border-b ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600" />
            ) : (
              <Sparkles className="w-4 h-4 text-blue-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-gray-500 hover:text-black">
            ×
          </button>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar (10 Items) */}
        <aside className="w-full md:w-64 bg-[#FBF9F5] border-r border-[#E5DED2] p-3 space-y-1 shrink-0">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#8E867B]">
            Bagian Pengaturan
          </div>
          {menuSections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id as ConfigSection)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                  isActive
                    ? 'bg-[var(--color-maroon,#800020)] text-white shadow-xs font-semibold'
                    : 'text-[#5E564F] hover:bg-[#F0EBE1] hover:text-[#292522]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--color-gold,#D4A373)]' : 'text-[#800020]'}`} />
                  <span className="truncate">{sec.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 opacity-60 ${isActive ? 'text-white' : 'text-[#8E867B]'}`} />
              </button>
            );
          })}

          {/* Quick Help box */}
          <div className="mt-6 p-3 rounded-xl bg-white border border-[#E5DED2] text-[11px] text-[#6D675F] space-y-1.5">
            <div className="font-semibold text-[#800020] flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Panduan Kurator</span>
            </div>
            <p>
              Perubahan disimpan ke <strong>Draf</strong> terlebih dahulu untuk diuji. Klik <strong>Publikasikan</strong> agar live di Google Sheets & web publik.
            </p>
          </div>
        </aside>

        {/* Content Body Area */}
        <main className="flex-1 p-6 md:p-8 bg-white overflow-y-auto max-h-[85vh]">
          {/* SECTION 1: IDENTITAS MEREK */}
          {activeSection === 'brand' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#292522]">1. Identitas Merek (Brand Identity)</h3>
                <p className="text-xs text-[#6D675F]">
                  Tentukan penamaan, deskripsi, logo, serta identitas resmi platform yang tampil pada navbar, footer, dan metadata.
                </p>
              </div>

              {/* Logo Mode & Upload */}
              <div className="p-4 rounded-xl bg-[#F8F3E9] border border-[#E5DED2] space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#292522]">Format Lambang / Logo Utama</label>
                  <div className="flex items-center gap-2 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="logoMode"
                        checked={formData.brand.logoMode === 'symbol'}
                        onChange={() => updateField('brand.logoMode', 'symbol')}
                      />
                      <span>Insignia Orisinil (Simbol)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="logoMode"
                        checked={formData.brand.logoMode === 'image'}
                        onChange={() => updateField('brand.logoMode', 'image')}
                      />
                      <span>Gambar / Logo Kustom (Drive / URL)</span>
                    </label>
                  </div>
                </div>

                {formData.brand.logoMode === 'image' && (
                  <div className="space-y-3 pt-2 border-t border-[#E5DED2]">
                    <div>
                      <label className="block text-xs font-medium text-[#5E564F] mb-1">
                        URL Logo Utama atau Google Drive File ID
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.brand.logoImageUrl}
                          onChange={(e) => updateField('brand.logoImageUrl', e.target.value)}
                          placeholder="https://... atau ID File Google Drive"
                          className="flex-1 text-xs px-3 py-2 rounded-lg bg-white border border-[#E5DED2] focus:outline-none focus:ring-1 focus:ring-[#800020]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setDrivePickerTarget('logo');
                            setIsDrivePickerOpen(true);
                          }}
                          className="px-3 py-2 rounded-lg text-xs font-medium bg-[#800020] text-white hover:bg-[#590018] flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Pilih dari Drive</span>
                        </button>
                      </div>
                    </div>

                    {formData.brand.logoImageUrl && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#E5DED2]">
                        <img
                          src={formData.brand.logoImageUrl}
                          alt="Pratinjau Logo"
                          className="h-10 w-auto max-w-[120px] object-contain border border-[#E5DED2] rounded p-1"
                          onError={(e) => {
                            (e.target as any).src = 'https://placehold.co/120x40?text=Logo+Error';
                          }}
                        />
                        <div className="text-[11px] text-[#6D675F]">
                          <p className="font-semibold text-[#292522]">Pratinjau Logo Aktif</p>
                          <p>Format yang disarankan: PNG transparan atau SVG (tinggi proporsional ~40px).</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* App Names & Descriptor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#292522] mb-1">
                    Nama Aplikasi / Platform
                  </label>
                  <input
                    type="text"
                    value={formData.brand.appName}
                    onChange={(e) => updateField('brand.appName', e.target.value)}
                    placeholder="ADARUPA"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-[#F8F3E9] border border-[#E5DED2] focus:outline-none focus:ring-1 focus:ring-[#800020]"
                  />
                  <p className="text-[10px] text-[#8E867B] mt-1">Nama primer yang muncul di tajuk & tab peramban.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#292522] mb-1">
                    Deskriptor / Slogan Utama
                  </label>
                  <input
                    type="text"
                    value={formData.brand.descriptor}
                    onChange={(e) => updateField('brand.descriptor', e.target.value)}
                    placeholder="Jelajah Budaya Nusantara"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-[#F8F3E9] border border-[#E5DED2] focus:outline-none focus:ring-1 focus:ring-[#800020]"
                  />
                  <p className="text-[10px] text-[#8E867B] mt-1">Deskriptor editorial pendamping nama merek.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#292522] mb-1">
                  Tagline Ringkas
                </label>
                <input
                  type="text"
                  value={formData.brand.tagline}
                  onChange={(e) => updateField('brand.tagline', e.target.value)}
                  placeholder="Ensiklopedi Digital Seni & Tradisi Indonesia"
                  className="w-full text-xs px-3 py-2 rounded-lg bg-[#F8F3E9] border border-[#E5DED2] focus:outline-none focus:ring-1 focus:ring-[#800020]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#292522] mb-1">
                  Deskripsi Narasi Merek
                </label>
                <textarea
                  rows={3}
                  value={formData.brand.brandDescription}
                  onChange={(e) => updateField('brand.brandDescription', e.target.value)}
                  placeholder="Deskripsi komprehensif mengenai visi, nilai, dan khazanah kebudayaan yang dihimpun..."
                  className="w-full text-xs p-3 rounded-lg bg-[#F8F3E9] border border-[#E5DED2] focus:outline-none focus:ring-1 focus:ring-[#800020]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#292522] mb-1">
                    Nama Kurator / Dewan Editorial
                  </label>
                  <input
                    type="text"
                    value={formData.brand.editorialCurator}
                    onChange={(e) => updateField('brand.editorialCurator', e.target.value)}
                    placeholder="Dewan Kurasi Adarupa Nusantara"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-[#F8F3E9] border border-[#E5DED2] focus:outline-none focus:ring-1 focus:ring-[#800020]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#292522] mb-1">
                    Email Kontak Resmi
                  </label>
                  <input
                    type="email"
                    value={formData.brand.contactEmail}
                    onChange={(e) => updateField('brand.contactEmail', e.target.value)}
                    placeholder="redaksi@adarupa.id"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-[#F8F3E9] border border-[#E5DED2] focus:outline-none focus:ring-1 focus:ring-[#800020]"
                  />
                </div>
              </div>

              {/* Favicon URL */}
              <div>
                <label className="block text-xs font-semibold text-[#292522] mb-1">
                  URL Ikon Favicon Peramban (.ico / .png / .svg)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.brand.faviconUrl || ''}
                    onChange={(e) => updateField('brand.faviconUrl', e.target.value)}
                    placeholder="/favicon.ico atau https://.../favicon.png"
                    className="flex-1 text-xs px-3 py-2 rounded-lg bg-[#F8F3E9] border border-[#E5DED2] focus:outline-none focus:ring-1 focus:ring-[#800020]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setDrivePickerTarget('favicon');
                      setIsDrivePickerOpen(true);
                    }}
                    className="px-3 py-2 rounded-lg text-xs font-medium bg-[#800020] text-white hover:bg-[#590018] flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih dari Drive</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: TEMA DAN WARNA */}
          {activeSection === 'theme' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#292522]">2. Tema dan Warna (Visual Theme & Palettes)</h3>
                <p className="text-xs text-[#6D675F]">
                  Sesuaikan warna primer, aksen, latar belakang gading, serta tipografi editorial khas Nusantara tanpa mengubah kode program.
                </p>
              </div>

              {/* Color Pickers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl border border-[#E5DED2] bg-[#FBF9F5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#292522]">Merah Marun (Primary)</span>
                    <input
                      type="color"
                      value={formData.theme.primaryMaroon}
                      onChange={(e) => updateField('theme.primaryMaroon', e.target.value)}
                      className="w-7 h-7 rounded border-none cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.theme.primaryMaroon}
                    onChange={(e) => updateField('theme.primaryMaroon', e.target.value)}
                    className="w-full text-xs font-mono px-2 py-1 rounded bg-white border border-[#E5DED2]"
                  />
                  <div className="h-4 rounded" style={{ backgroundColor: formData.theme.primaryMaroon }} />
                </div>

                <div className="p-3.5 rounded-xl border border-[#E5DED2] bg-[#FBF9F5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#292522]">Marun Pekat (Deep)</span>
                    <input
                      type="color"
                      value={formData.theme.deepMaroon}
                      onChange={(e) => updateField('theme.deepMaroon', e.target.value)}
                      className="w-7 h-7 rounded border-none cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.theme.deepMaroon}
                    onChange={(e) => updateField('theme.deepMaroon', e.target.value)}
                    className="w-full text-xs font-mono px-2 py-1 rounded bg-white border border-[#E5DED2]"
                  />
                  <div className="h-4 rounded" style={{ backgroundColor: formData.theme.deepMaroon }} />
                </div>

                <div className="p-3.5 rounded-xl border border-[#E5DED2] bg-[#FBF9F5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#292522]">Hijau Rimba (Forest)</span>
                    <input
                      type="color"
                      value={formData.theme.forestGreen}
                      onChange={(e) => updateField('theme.forestGreen', e.target.value)}
                      className="w-7 h-7 rounded border-none cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.theme.forestGreen}
                    onChange={(e) => updateField('theme.forestGreen', e.target.value)}
                    className="w-full text-xs font-mono px-2 py-1 rounded bg-white border border-[#E5DED2]"
                  />
                  <div className="h-4 rounded" style={{ backgroundColor: formData.theme.forestGreen }} />
                </div>

                <div className="p-3.5 rounded-xl border border-[#E5DED2] bg-[#FBF9F5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#292522]">Kuning Emas (Warm Gold)</span>
                    <input
                      type="color"
                      value={formData.theme.warmGold}
                      onChange={(e) => updateField('theme.warmGold', e.target.value)}
                      className="w-7 h-7 rounded border-none cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.theme.warmGold}
                    onChange={(e) => updateField('theme.warmGold', e.target.value)}
                    className="w-full text-xs font-mono px-2 py-1 rounded bg-white border border-[#E5DED2]"
                  />
                  <div className="h-4 rounded" style={{ backgroundColor: formData.theme.warmGold }} />
                </div>

                <div className="p-3.5 rounded-xl border border-[#E5DED2] bg-[#FBF9F5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#292522]">Latar Gading (Ivory)</span>
                    <input
                      type="color"
                      value={formData.theme.ivoryBackground}
                      onChange={(e) => updateField('theme.ivoryBackground', e.target.value)}
                      className="w-7 h-7 rounded border-none cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.theme.ivoryBackground}
                    onChange={(e) => updateField('theme.ivoryBackground', e.target.value)}
                    className="w-full text-xs font-mono px-2 py-1 rounded bg-white border border-[#E5DED2]"
                  />
                  <div className="h-4 rounded border border-gray-300" style={{ backgroundColor: formData.theme.ivoryBackground }} />
                </div>

                <div className="p-3.5 rounded-xl border border-[#E5DED2] bg-[#FBF9F5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#292522]">Aksen Terakota</span>
                    <input
                      type="color"
                      value={formData.theme.terracottaAccent}
                      onChange={(e) => updateField('theme.terracottaAccent', e.target.value)}
                      className="w-7 h-7 rounded border-none cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.theme.terracottaAccent}
                    onChange={(e) => updateField('theme.terracottaAccent', e.target.value)}
                    className="w-full text-xs font-mono px-2 py-1 rounded bg-white border border-[#E5DED2]"
                  />
                  <div className="h-4 rounded" style={{ backgroundColor: formData.theme.terracottaAccent }} />
                </div>
              </div>

              {/* Typography & Batik Settings */}
              <div className="p-4 rounded-xl bg-[#F8F3E9] border border-[#E5DED2] space-y-4">
                <h4 className="text-xs font-bold text-[#292522] uppercase tracking-wider">
                  Pengaturan Tipografi & Corak Nusantara
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#5E564F] mb-1">
                      Keluarga Font Judul (Headings)
                    </label>
                    <select
                      value={formData.theme.fontHeading}
                      onChange={(e) => updateField('theme.fontHeading', e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#E5DED2] focus:outline-none"
                    >
                      <option value="Playfair Display">Playfair Display (Serif Klasik)</option>
                      <option value="Cinzel">Cinzel (Epik / Monumen)</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (Geometris Modern)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#5E564F] mb-1">
                      Keluarga Font Teks Isi (Body Text)
                    </label>
                    <select
                      value={formData.theme.fontBody}
                      onChange={(e) => updateField('theme.fontBody', e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#E5DED2] focus:outline-none"
                    >
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern & Bersih)</option>
                      <option value="DM Sans">DM Sans (Netral Terbaca)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E5DED2]">
                  <div>
                    <p className="text-xs font-semibold text-[#292522]">Aksen Pola Batik Nusantara</p>
                    <p className="text-[11px] text-[#6D675F]">Aktifkan siluet ornamen mega mendung / parang pada tajuk dan kartu.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.theme.enableBatikPatterns}
                      onChange={(e) => updateField('theme.enableBatikPatterns', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-maroon,#800020)]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: BERANDA */}
          {activeSection === 'hero' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#292522]">3. Beranda & Tajuk Seksi (Homepage Editorial)</h3>
                <p className="text-xs text-[#6D675F]">
                  Ubah tajuk utama hero banner, tombol ajakan bertindak (CTA), serta judul dan subjudul seluruh seksi di beranda publik.
                </p>
              </div>

              {/* Hero Banner Form */}
              <div className="p-4 rounded-xl bg-[#F8F3E9] border border-[#E5DED2] space-y-4">
                <h4 className="text-xs font-bold text-[#800020] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Hero Banner Utama</span>
                </h4>

                <div>
                  <label className="block text-xs font-medium text-[#5E564F] mb-1">
                    Label Kicker / Lencana Atas
                  </label>
                  <input
                    type="text"
                    value={formData.hero.kickerBadge}
                    onChange={(e) => updateField('hero.kickerBadge', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#E5DED2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#5E564F] mb-1">
                    Judul Utama Hero (Heading)
                  </label>
                  <input
                    type="text"
                    value={formData.hero.mainHeadline}
                    onChange={(e) => updateField('hero.mainHeadline', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#E5DED2] font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#5E564F] mb-1">
                    Subjudul Hero (Subtitle / Narasi)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.hero.supportingDescription}
                    onChange={(e) => updateField('hero.supportingDescription', e.target.value)}
                    className="w-full text-xs p-3 rounded-lg bg-white border border-[#E5DED2]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#5E564F] mb-1">
                      Label Tombol Primer (CTA 1)
                    </label>
                    <input
                      type="text"
                      value={formData.hero.primaryCtaLabel}
                      onChange={(e) => updateField('hero.primaryCtaLabel', e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#E5DED2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5E564F] mb-1">
                      Tujuan Tautan Primer
                    </label>
                    <input
                      type="text"
                      value={formData.hero.primaryCtaLink}
                      onChange={(e) => updateField('hero.primaryCtaLink', e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#E5DED2]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#5E564F] mb-1">
                      Label Tombol Sekunder (CTA 2)
                    </label>
                    <input
                      type="text"
                      value={formData.hero.secondaryCtaLabel}
                      onChange={(e) => updateField('hero.secondaryCtaLabel', e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#E5DED2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5E564F] mb-1">
                      Tujuan Tautan Sekunder
                    </label>
                    <input
                      type="text"
                      value={formData.hero.secondaryCtaLink}
                      onChange={(e) => updateField('hero.secondaryCtaLink', e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#E5DED2]"
                    />
                  </div>
                </div>
              </div>

              {/* Section Headings Form */}
              <div className="p-4 rounded-xl bg-white border border-[#E5DED2] space-y-4">
                <h4 className="text-xs font-bold text-[#292522] uppercase tracking-wider">
                  Judul & Subjudul Seksi Beranda
                </h4>

                <div className="space-y-4">
                  <div className="p-3 bg-[#FBF9F5] rounded-lg border border-[#E5DED2] space-y-2">
                    <span className="text-xs font-bold text-[#800020]">Seksi Lalakon (Visual)</span>
                    <input
                      type="text"
                      value={formData.sections.lalakonSectionTitle}
                      onChange={(e) => updateField('sections.lalakonSectionTitle', e.target.value)}
                      placeholder="Judul Seksi"
                      className="w-full text-xs px-3 py-1.5 rounded bg-white border border-[#E5DED2]"
                    />
                    <input
                      type="text"
                      value={formData.sections.lalakonViewAllLabel}
                      onChange={(e) => updateField('sections.lalakonViewAllLabel', e.target.value)}
                      placeholder="Label Tautan Lihat Semua"
                      className="w-full text-xs px-3 py-1.5 rounded bg-white border border-[#E5DED2]"
                    />
                  </div>

                  <div className="p-3 bg-[#FBF9F5] rounded-lg border border-[#E5DED2] space-y-2">
                    <span className="text-xs font-bold text-[#800020]">Seksi Gema Swara (Audio)</span>
                    <input
                      type="text"
                      value={formData.sections.gemaSwaraSectionTitle}
                      onChange={(e) => updateField('sections.gemaSwaraSectionTitle', e.target.value)}
                      placeholder="Judul Seksi"
                      className="w-full text-xs px-3 py-1.5 rounded bg-white border border-[#E5DED2]"
                    />
                    <input
                      type="text"
                      value={formData.sections.gemaSwaraSectionSubtitle}
                      onChange={(e) => updateField('sections.gemaSwaraSectionSubtitle', e.target.value)}
                      placeholder="Subjudul Seksi"
                      className="w-full text-xs px-3 py-1.5 rounded bg-white border border-[#E5DED2]"
                    />
                  </div>

                  <div className="p-3 bg-[#FBF9F5] rounded-lg border border-[#E5DED2] space-y-2">
                    <span className="text-xs font-bold text-[#800020]">Seksi Gelanggang (Permainan)</span>
                    <input
                      type="text"
                      value={formData.sections.gelanggangSectionTitle}
                      onChange={(e) => updateField('sections.gelanggangSectionTitle', e.target.value)}
                      placeholder="Judul Seksi"
                      className="w-full text-xs px-3 py-1.5 rounded bg-white border border-[#E5DED2]"
                    />
                    <input
                      type="text"
                      value={formData.sections.gelanggangViewAllLabel}
                      onChange={(e) => updateField('sections.gelanggangViewAllLabel', e.target.value)}
                      placeholder="Label Tautan Lihat Semua"
                      className="w-full text-xs px-3 py-1.5 rounded bg-white border border-[#E5DED2]"
                    />
                  </div>

                  <div className="p-3 bg-[#FBF9F5] rounded-lg border border-[#E5DED2] space-y-2">
                    <span className="text-xs font-bold text-[#800020]">Seksi Pagelaran (Perhelatan)</span>
                    <input
                      type="text"
                      value={formData.sections.pagelaranSectionTitle}
                      onChange={(e) => updateField('sections.pagelaranSectionTitle', e.target.value)}
                      placeholder="Judul Seksi"
                      className="w-full text-xs px-3 py-1.5 rounded bg-white border border-[#E5DED2]"
                    />
                    <input
                      type="text"
                      value={formData.sections.pagelaranViewAllLabel}
                      onChange={(e) => updateField('sections.pagelaranViewAllLabel', e.target.value)}
                      placeholder="Label Tautan Lihat Semua"
                      className="w-full text-xs px-3 py-1.5 rounded bg-white border border-[#E5DED2]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: NAVIGASI */}
          {activeSection === 'navigation' && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#292522]">4. Navigasi Bilah Atas (Navbar Menu)</h3>
                  <p className="text-xs text-[#6D675F]">
                    Atur teks label tautan, visibilitas, urutan tampilan, atau tambahkan tautan khusus pada bilah navigasi publik.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddNavItem}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#800020] text-white hover:bg-[#590018] flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Menu</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.navigation.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
                      item.isVisible ? 'bg-white border-[#E5DED2]' : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {/* Reorder Buttons */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveNavItem(index, 'up')}
                          className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5 text-[#5E564F]" />
                        </button>
                        <button
                          type="button"
                          disabled={index === formData.navigation.length - 1}
                          onClick={() => handleMoveNavItem(index, 'down')}
                          className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5 text-[#5E564F]" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-[#8E867B] block">Label Tautan</label>
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => handleUpdateNavItem(index, 'label', e.target.value)}
                            className="text-xs px-2.5 py-1.5 rounded bg-[#F8F3E9] border border-[#E5DED2] w-full"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-[#8E867B] block">Path / Rute</label>
                          <input
                            type="text"
                            value={item.path}
                            onChange={(e) => handleUpdateNavItem(index, 'path', e.target.value)}
                            className="text-xs px-2.5 py-1.5 rounded bg-[#F8F3E9] border border-[#E5DED2] w-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions: Visibility Toggle & Delete */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleToggleNavVisibility(index)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border ${
                          item.isVisible
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-gray-200 text-gray-700 border-gray-300'
                        }`}
                      >
                        {item.isVisible ? 'Tampil' : 'Sembunyi'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteNavItem(index)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                        title="Hapus Tautan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: KATEGORI & SUBKATEGORI */}
          {activeSection === 'categories' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#292522]">5. Kategori Resmi Nusantara</h3>
                <p className="text-xs text-[#6D675F]">
                  Platform memiliki 4 kategori permanen. Anda dapat menyesuaikan nama tampilan, narasi, gambar sampul, dan lencana tanpa merusak integrasi URL.
                </p>
              </div>

              {/* Category Slug Selector Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-[#E5DED2] pb-3">
                {formData.categories.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => setActiveCategorySlug(cat.slug)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                      activeCategorySlug === cat.slug
                        ? 'bg-[var(--color-maroon,#800020)] text-white shadow-xs'
                        : 'bg-[#F8F3E9] text-[#5E564F] hover:bg-[#F0EBE1]'
                    }`}
                  >
                    <span>{cat.displayName}</span>
                    <span className="text-[10px] opacity-75 font-mono">({cat.slug})</span>
                  </button>
                ))}
              </div>

              {/* Active Category Editor Form */}
              {(() => {
                const curCat = formData.categories.find((c) => c.slug === activeCategorySlug);
                if (!curCat) return null;

                const updateCatField = (key: keyof CategoryDisplayConfig, val: any) => {
                  const updated = formData.categories.map((c) =>
                    c.slug === activeCategorySlug ? { ...c, [key]: val } : c
                  );
                  updateField('categories', updated);
                };

                return (
                  <div className="p-5 rounded-2xl bg-[#F8F3E9] border border-[#E5DED2] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#800020]" />
                        <span className="text-xs font-mono font-bold text-[#800020]">
                          Slug URL: /{curCat.slug} (Permanen)
                        </span>
                      </div>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-white text-[#292522] border border-[#E5DED2] font-semibold">
                        Urutan Tampil: #{curCat.displayOrder}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#292522] mb-1">
                          Nama Tampilan Kategori
                        </label>
                        <input
                          type="text"
                          value={curCat.displayName}
                          onChange={(e) => updateCatField('displayName', e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#E5DED2]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#292522] mb-1">
                          Label Lencana (Badge)
                        </label>
                        <input
                          type="text"
                          value={curCat.badgeLabel}
                          onChange={(e) => updateCatField('badgeLabel', e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#E5DED2]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#292522] mb-1">
                        Deskripsi Editorial
                      </label>
                      <textarea
                        rows={3}
                        value={curCat.description}
                        onChange={(e) => updateCatField('description', e.target.value)}
                        className="w-full text-xs p-3 rounded-lg bg-white border border-[#E5DED2]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#292522] mb-1">
                        Subteks Ringkas / Pelengkap
                      </label>
                      <input
                        type="text"
                        value={curCat.subtext}
                        onChange={(e) => updateCatField('subtext', e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#E5DED2]"
                      />
                    </div>

                    {/* Cover Image URL / Drive Asset */}
                    <div>
                      <label className="block text-xs font-semibold text-[#292522] mb-1">
                        URL Gambar Sampul Kategori
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={curCat.coverImageUrl || ''}
                          onChange={(e) => updateCatField('coverImageUrl', e.target.value)}
                          placeholder="https://... atau ID File Google Drive"
                          className="flex-1 text-xs px-3 py-2 rounded-lg bg-white border border-[#E5DED2]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setDrivePickerTarget('category');
                            setIsDrivePickerOpen(true);
                          }}
                          className="px-3 py-2 rounded-lg text-xs font-medium bg-[#800020] text-white hover:bg-[#590018] flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Pilih dari Drive</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* SECTION 6: HALAMAN STATIS */}
          {activeSection === 'staticPages' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#292522]">6. Halaman Statis & Kebijakan Platform</h3>
                <p className="text-xs text-[#6D675F]">
                  Sunting naskah Tentang Kami, Pedoman Kurasi, Kebijakan Privasi, dan Syarat Penggunaan yang dapat diakses publik.
                </p>
              </div>

              {/* Tabs for static pages */}
              <div className="flex flex-wrap gap-2 border-b border-[#E5DED2] pb-3">
                {[
                  { key: 'about', label: 'Tentang Kami (/tentang)' },
                  { key: 'guidelines', label: 'Pedoman Konten (/pedoman-konten)' },
                  { key: 'privacy', label: 'Kebijakan Privasi (/kebijakan-privasi)' },
                  { key: 'terms', label: 'Syarat Ketentuan (/syarat-ketentuan)' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveStaticTab(tab.key as StaticPageTab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activeStaticTab === tab.key
                        ? 'bg-[var(--color-maroon,#800020)] text-white shadow-xs'
                        : 'bg-[#F8F3E9] text-[#5E564F] hover:bg-[#F0EBE1]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: About */}
              {activeStaticTab === 'about' && (
                <div className="p-5 rounded-2xl bg-[#F8F3E9] border border-[#E5DED2] space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#292522] mb-1">Judul Halaman</label>
                    <input
                      type="text"
                      value={formData.staticPages.aboutTitle}
                      onChange={(e) => updateField('staticPages.aboutTitle', e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#E5DED2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#292522] mb-1">Subjudul Halaman</label>
                    <input
                      type="text"
                      value={formData.staticPages.aboutSubtitle}
                      onChange={(e) => updateField('staticPages.aboutSubtitle', e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#E5DED2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#292522] mb-1">Isi Konten Narasi</label>
                    <textarea
                      rows={10}
                      value={formData.staticPages.aboutBody}
                      onChange={(e) => updateField('staticPages.aboutBody', e.target.value)}
                      className="w-full text-xs p-3 font-mono leading-relaxed rounded-lg bg-white border border-[#E5DED2]"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Guidelines */}
              {activeStaticTab === 'guidelines' && (
                <div className="p-5 rounded-2xl bg-[#F8F3E9] border border-[#E5DED2] space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#292522] mb-1">Judul Halaman</label>
                    <input
                      type="text"
                      value={formData.staticPages.guidelinesTitle}
                      onChange={(e) => updateField('staticPages.guidelinesTitle', e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#E5DED2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#292522] mb-1">Isi Konten Pedoman</label>
                    <textarea
                      rows={10}
                      value={formData.staticPages.guidelinesBody}
                      onChange={(e) => updateField('staticPages.guidelinesBody', e.target.value)}
                      className="w-full text-xs p-3 font-mono leading-relaxed rounded-lg bg-white border border-[#E5DED2]"
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Privacy */}
              {activeStaticTab === 'privacy' && (
                <div className="p-5 rounded-2xl bg-[#F8F3E9] border border-[#E5DED2] space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#292522] mb-1">Judul Halaman</label>
                    <input
                      type="text"
                      value={formData.staticPages.privacyPolicyTitle}
                      onChange={(e) => updateField('staticPages.privacyPolicyTitle', e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#E5DED2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#292522] mb-1">Isi Kebijakan Privasi</label>
                    <textarea
                      rows={10}
                      value={formData.staticPages.privacyPolicyBody}
                      onChange={(e) => updateField('staticPages.privacyPolicyBody', e.target.value)}
                      className="w-full text-xs p-3 font-mono leading-relaxed rounded-lg bg-white border border-[#E5DED2]"
                    />
                  </div>
                </div>
              )}

              {/* Tab 4: Terms */}
              {activeStaticTab === 'terms' && (
                <div className="p-5 rounded-2xl bg-[#F8F3E9] border border-[#E5DED2] space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#292522] mb-1">Judul Halaman</label>
                    <input
                      type="text"
                      value={formData.staticPages.termsOfUseTitle}
                      onChange={(e) => updateField('staticPages.termsOfUseTitle', e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#E5DED2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#292522] mb-1">Isi Syarat Penggunaan</label>
                    <textarea
                      rows={10}
                      value={formData.staticPages.termsOfUseBody}
                      onChange={(e) => updateField('staticPages.termsOfUseBody', e.target.value)}
                      className="w-full text-xs p-3 font-mono leading-relaxed rounded-lg bg-white border border-[#E5DED2]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 7: TEKS ANTARMUKA (UI STRINGS) */}
          {activeSection === 'uiStrings' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#292522]">7. Teks Antarmuka (UI Strings & Messages)</h3>
                <p className="text-xs text-[#6D675F]">
                  Konfigurasi teks placeholder pencarian, tombol aksi, pesan ketika koleksi kosong, serta pesan notifikasi pengguna.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#292522] mb-1">
                    Teks Tombol Pencarian Navbar
                  </label>
                  <input
                    type="text"
                    value={formData.uiStrings.searchButtonLabel}
                    onChange={(e) => updateField('uiStrings.searchButtonLabel', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-[#F8F3E9] border border-[#E5DED2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#292522] mb-1">
                    Placeholder Modal Pencarian
                  </label>
                  <input
                    type="text"
                    value={formData.uiStrings.searchPlaceholder}
                    onChange={(e) => updateField('uiStrings.searchPlaceholder', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-[#F8F3E9] border border-[#E5DED2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#292522] mb-1">
                    Label Tombol Putar Audio
                  </label>
                  <input
                    type="text"
                    value={formData.uiStrings.playAudioLabel}
                    onChange={(e) => updateField('uiStrings.playAudioLabel', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-[#F8F3E9] border border-[#E5DED2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#292522] mb-1">
                    Label Tombol Putar Video
                  </label>
                  <input
                    type="text"
                    value={formData.uiStrings.playVideoLabel}
                    onChange={(e) => updateField('uiStrings.playVideoLabel', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-[#F8F3E9] border border-[#E5DED2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#292522] mb-1">
                    Label Tombol Lihat Rincian
                  </label>
                  <input
                    type="text"
                    value={formData.uiStrings.viewDetailsLabel}
                    onChange={(e) => updateField('uiStrings.viewDetailsLabel', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-[#F8F3E9] border border-[#E5DED2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#292522] mb-1">
                    Label Tombol Bagikan
                  </label>
                  <input
                    type="text"
                    value={formData.uiStrings.shareActionLabel}
                    onChange={(e) => updateField('uiStrings.shareActionLabel', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-[#F8F3E9] border border-[#E5DED2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#292522] mb-1">
                    Notifikasi Salin Tautan (Toast)
                  </label>
                  <input
                    type="text"
                    value={formData.uiStrings.shareSuccessMessage}
                    onChange={(e) => updateField('uiStrings.shareSuccessMessage', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-[#F8F3E9] border border-[#E5DED2]"
                  />
                </div>
              </div>

              {/* Empty States */}
              <div className="p-4 rounded-xl bg-[#F8F3E9] border border-[#E5DED2] space-y-3">
                <h4 className="text-xs font-bold text-[#800020] uppercase tracking-wider">
                  Pesan Keadaan Kosong (Empty States)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#5E564F] mb-1">
                      Judul Pencarian Tidak Ditemukan
                    </label>
                    <input
                      type="text"
                      value={formData.uiStrings.noResultsFoundTitle}
                      onChange={(e) => updateField('uiStrings.noResultsFoundTitle', e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#E5DED2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5E564F] mb-1">
                      Deskripsi Pencarian Tidak Ditemukan
                    </label>
                    <input
                      type="text"
                      value={formData.uiStrings.noResultsFoundDescription}
                      onChange={(e) => updateField('uiStrings.noResultsFoundDescription', e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#E5DED2]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 8: FOOTER DAN INFORMASI KONTAK */}
          {activeSection === 'footer' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#292522]">8. Footer dan Informasi Kontak</h3>
                <p className="text-xs text-[#6D675F]">
                  Sesuaikan pernyataan misi, kutipan kebudayaan, informasi kontak redaksi, serta tautan jejaring sosial pada bagian dasar website.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#292522] mb-1">
                    Pernyataan Misi Kebudayaan (Mission Statement)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.footer.brandMissionText}
                    onChange={(e) => updateField('footer.brandMissionText', e.target.value)}
                    className="w-full text-xs p-3 rounded-lg bg-[#F8F3E9] border border-[#E5DED2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#292522] mb-1">
                    Kutipan Falsafah / Kata Mutiara Budaya (Quote)
                  </label>
                  <input
                    type="text"
                    value={formData.footer.taglineQuote}
                    onChange={(e) => updateField('footer.taglineQuote', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-[#F8F3E9] border border-[#E5DED2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#292522] mb-1">
                    Format Teks Hak Cipta (Copyright Notice)
                  </label>
                  <input
                    type="text"
                    value={formData.footer.copyrightText}
                    onChange={(e) => updateField('footer.copyrightText', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-[#F8F3E9] border border-[#E5DED2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#292522] mb-1">
                    Ajakan Kontak Redaksi
                  </label>
                  <textarea
                    rows={2}
                    value={formData.footer.contactInvitationText}
                    onChange={(e) => updateField('footer.contactInvitationText', e.target.value)}
                    className="w-full text-xs p-3 rounded-lg bg-[#F8F3E9] border border-[#E5DED2]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 9: PRATINJAU DAN PUBLIKASI */}
          {activeSection === 'preview_publish' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#292522]">9. Pratinjau dan Publikasi (Preview & Release)</h3>
                  <p className="text-xs text-[#6D675F]">
                    Uji tampilan dalam simulasi desktop dan mobile sebelum merilis ke publik luas.
                  </p>
                </div>

                {/* Device Switcher */}
                <div className="flex items-center gap-2 p-1 bg-[#F8F3E9] rounded-xl border border-[#E5DED2]">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                      previewDevice === 'desktop'
                        ? 'bg-white text-[#800020] shadow-xs'
                        : 'text-[#6D675F] hover:text-[#292522]'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                      previewDevice === 'mobile'
                        ? 'bg-white text-[#800020] shadow-xs'
                        : 'text-[#6D675F] hover:text-[#292522]'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile View (375px)</span>
                  </button>
                </div>
              </div>

              {/* Publication Status & Diff Overview */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <span>Perubahan Menunggu Publikasi</span>
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Konfigurasi saat ini berstatus <strong>Draf Terkini</strong>. Pengunjung publik masih melihat konfigurasi yang telah dipublikasikan sebelumnya sampai Anda menekan tombol publikasikan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsConfirmPublishOpen(true)}
                  disabled={isPublishing}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--color-maroon,#800020)] hover:bg-[var(--color-maroon-deep,#590018)] text-white shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-gold,#D4A373)]" />
                  <span>Publikasikan Sekarang</span>
                </button>
              </div>

              {/* Viewport Simulator Container */}
              <div className="flex justify-center bg-[#F1ECE0] p-6 rounded-2xl border border-[#E5DED2] overflow-x-auto min-h-[460px]">
                <div
                  className={`transition-all duration-300 bg-white rounded-2xl shadow-xl border border-gray-300 overflow-hidden flex flex-col ${
                    previewDevice === 'mobile' ? 'w-[375px]' : 'w-full max-w-4xl'
                  }`}
                >
                  {/* Browser simulated chrome */}
                  <div className="bg-[#292522] text-white px-4 py-2 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <span className="ml-2 font-mono text-[10px] text-gray-300">
                        adarupa.id — {previewDevice === 'mobile' ? 'Mobile 375px' : 'Desktop View'}
                      </span>
                    </div>
                    <span className="text-[10px] text-[var(--color-gold,#D4A373)] font-semibold">
                      DRAF LIVE PREVIEW
                    </span>
                  </div>

                  {/* Simulated Navbar */}
                  <div
                    className="p-3.5 border-b flex items-center justify-between"
                    style={{ backgroundColor: formData.theme.ivoryBackground, borderColor: formData.theme.borderColor }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: formData.theme.primaryMaroon }}
                      >
                        <span className="text-xs font-serif font-bold">A</span>
                      </div>
                      <div>
                        <div className="font-serif font-bold text-xs" style={{ color: formData.theme.primaryMaroon }}>
                          {formData.brand.appName}
                        </div>
                        <div className="text-[9px]" style={{ color: formData.theme.secondaryText }}>
                          {formData.brand.descriptor}
                        </div>
                      </div>
                    </div>

                    {/* Navigation Pills */}
                    <div className="hidden sm:flex items-center gap-3 text-xs font-medium" style={{ color: formData.theme.primaryText }}>
                      {formData.navigation.filter((n) => n.isVisible).slice(0, 4).map((n) => (
                        <span key={n.id}>{n.label}</span>
                      ))}
                    </div>
                  </div>

                  {/* Simulated Hero Banner */}
                  <div
                    className="p-6 text-white text-center space-y-3"
                    style={{
                      background: `linear-gradient(135deg, ${formData.theme.primaryMaroon}, ${formData.theme.deepMaroon}, ${formData.theme.forestGreen})`
                    }}
                  >
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase"
                      style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: formData.theme.warmGold }}
                    >
                      {formData.hero.kickerBadge}
                    </span>
                    <h1 className="font-serif font-bold text-xl sm:text-2xl leading-tight">
                      {formData.hero.mainHeadline}
                    </h1>
                    <p className="text-xs text-[#D6CEBE] max-w-md mx-auto">
                      {formData.hero.supportingDescription}
                    </p>
                    <div className="pt-2 flex justify-center gap-2">
                      <button
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ backgroundColor: formData.theme.warmGold, color: '#292522' }}
                      >
                        {formData.hero.primaryCtaLabel}
                      </button>
                      <button
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-white/40 text-white"
                      >
                        {formData.hero.secondaryCtaLabel}
                      </button>
                    </div>
                  </div>

                  {/* Simulated Category Grid */}
                  <div className="p-4 grid grid-cols-2 gap-3" style={{ backgroundColor: formData.theme.ivoryBackground }}>
                    {formData.categories.map((c) => (
                      <div
                        key={c.slug}
                        className="p-3 rounded-xl border bg-white"
                        style={{ borderColor: formData.theme.borderColor }}
                      >
                        <span className="text-[10px] font-bold" style={{ color: formData.theme.primaryMaroon }}>
                          {c.badgeLabel}
                        </span>
                        <h4 className="font-serif font-bold text-xs" style={{ color: formData.theme.primaryText }}>
                          {c.displayName}
                        </h4>
                        <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5">
                          {c.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Simulated Footer */}
                  <div
                    className="p-4 border-t text-center text-[10px]"
                    style={{
                      backgroundColor: formData.theme.deepMaroon,
                      color: '#E5DED2'
                    }}
                  >
                    <p className="font-serif italic mb-1 text-[var(--color-gold,#D4A373)]">
                      "{formData.footer.taglineQuote}"
                    </p>
                    <p>{formData.footer.copyrightText}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 10: RIWAYAT PERUBAHAN & ROLLBACK */}
          {activeSection === 'history' && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#292522]">10. Riwayat Perubahan & Rollback</h3>
                  <p className="text-xs text-[#6D675F]">
                    Setiap aksi publikasi dicatat secara otomatis dalam lembar <strong>CONFIG_HISTORY</strong> & <strong>AUDIT_LOG</strong>. Anda dapat memulihkan konfigurasi lama kapan saja.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadHistoryAndMedia}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F8F3E9] hover:bg-[#F0EBE1] text-[#292522] border border-[#E5DED2] flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#800020]" />
                  <span>Segarkan Riwayat</span>
                </button>
              </div>

              {historyList.length === 0 ? (
                <div className="p-8 text-center bg-[#F8F3E9] rounded-2xl border border-[#E5DED2] text-xs text-[#6D675F]">
                  <History className="w-8 h-8 text-[#800020] mx-auto mb-2 opacity-60" />
                  <p className="font-semibold text-[#292522]">Belum ada arsip snapshot perubahan</p>
                  <p className="mt-1">Snapshot riwayat akan tercipta otomatis setiap kali Anda mempublikasikan konfigurasi baru.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyList.map((snap) => (
                    <div
                      key={snap.historyId}
                      className="p-4 rounded-xl bg-white border border-[#E5DED2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#800020] px-2 py-0.5 rounded bg-[#800020]/10">
                            Versi {snap.version}
                          </span>
                          <span className="text-xs font-semibold text-[#292522]">
                            {snap.publishedBy}
                          </span>
                          <span className="text-[11px] text-[#8E867B]">
                            {new Date(snap.publishedAt).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <p className="text-xs text-[#5E564F]">
                          {snap.summary || 'Pembaruan konfigurasi situs'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleRollback(snap.historyId)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Pulihkan Versi Ini</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODAL: GOOGLE DRIVE ASSET PICKER */}
      {isDrivePickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 border border-[#E5DED2] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5DED2] pb-3">
              <div className="flex items-center gap-2 text-[#800020]">
                <Upload className="w-5 h-5" />
                <h3 className="font-serif font-bold text-base text-[#292522]">
                  Pilih Aset Gambar dari Google Drive
                </h3>
              </div>
              <button
                onClick={() => setIsDrivePickerOpen(false)}
                className="text-gray-400 hover:text-black cursor-pointer text-lg"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-[#6D675F]">
              Berikut adalah berkas gambar yang terdaftar dalam inventaris Google Drive platform. Klik berkas untuk menautkannya secara langsung.
            </p>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {mediaAssets.filter((a) => a.mime_type.startsWith('image/')).length === 0 ? (
                <div className="p-6 text-center text-xs text-[#8E867B] bg-[#F8F3E9] rounded-xl">
                  Belum ada aset gambar tersimpan di Google Drive. Anda dapat mendaftarkan berkas gambar baru melalui tab "Kelola Aset Media Google Drive".
                </div>
              ) : (
                mediaAssets
                  .filter((a) => a.mime_type.startsWith('image/'))
                  .map((asset) => (
                    <button
                      key={asset.media_asset_id}
                      type="button"
                      onClick={() => handleSelectDriveAsset(asset)}
                      className="w-full text-left p-3 rounded-xl bg-[#F8F3E9] hover:bg-[#F1ECE0] border border-[#E5DED2] flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <ImageIcon className="w-5 h-5 text-[#800020] shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-[#292522]">{asset.file_name}</p>
                          <p className="text-[10px] text-[#6D675F] font-mono">ID: {asset.drive_file_id}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-[#800020]">Pilih Aset</span>
                    </button>
                  ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsDrivePickerOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM PUBLISH */}
      {isConfirmPublishOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#E5DED2] shadow-2xl">
            <div className="flex items-center gap-3 text-[#800020]">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="font-serif font-bold text-lg text-[#292522]">
                Konfirmasi Publikasi Website
              </h3>
            </div>

            <p className="text-xs text-[#5E564F] leading-relaxed">
              Anda akan mempublikasikan draf konfigurasi tampilan & konten ke seluruh pengunjung situs. Perubahan ini akan disimpan secara permanen di lembar <strong>SITE_CONTENT</strong> dan snapshot dicatat di <strong>CONFIG_HISTORY</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#292522] mb-1">
                Catatan Rangkuman Perubahan (Summary of Changes):
              </label>
              <input
                type="text"
                value={changesSummary}
                onChange={(e) => setChangesSummary(e.target.value)}
                placeholder="Misal: Penyesuaian warna maroon, tajuk hero, dan narasi tentang kami"
                className="w-full text-xs px-3 py-2 rounded-lg bg-[#F8F3E9] border border-[#E5DED2] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5DED2]">
              <button
                type="button"
                onClick={() => setIsConfirmPublishOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6D675F] hover:bg-gray-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--color-maroon,#800020)] hover:bg-[var(--color-maroon-deep,#590018)] text-white shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isPublishing ? 'Mempublikasikan...' : 'Ya, Publikasikan Sekarang'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
