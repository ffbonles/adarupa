import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Film,
  Calendar,
  FolderOpen,
  Tags,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  ExternalLink,
  Save,
  X,
  FileCheck,
  Check,
  Archive,
  Layers,
  Palette
} from 'lucide-react';
import { api } from '../../services/apiClient';
import {
  ContentItem,
  CulturalEvent,
  MediaAsset,
  AuditLogEntry,
  MainCategorySlug,
  PublicationStatus,
  EventStatus
} from '../../types';
import { BrandLogo } from '../../components/common/BrandLogo';
import { SiteConfigManager } from '../../components/admin/SiteConfigManager';

interface AdminDashboardPageProps {
  onLogout: () => void;
  onViewPublicSite: () => void;
}

type AdminTab = 'overview' | 'content' | 'events' | 'media' | 'categories' | 'site_config' | 'settings';

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onLogout,
  onViewPublicSite
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [metrics, setMetrics] = useState<any>(null);
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [eventList, setEventList] = useState<CulturalEvent[]>([]);
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Content Modal state
  const [editingContent, setEditingContent] = useState<Partial<ContentItem> | null>(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);

  // Event Modal state
  const [editingEvent, setEditingEvent] = useState<Partial<CulturalEvent> | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // Media Associate Modal state
  const [newMediaAsset, setNewMediaAsset] = useState<Partial<MediaAsset>>({
    drive_file_id: '',
    file_name: '',
    mime_type: 'video/mp4',
    asset_role: 'primary_media'
  });
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  // Settings state
  const [gasUrlInput, setGasUrlInput] = useState('');
  const [pingStatus, setPingStatus] = useState<{ testing: boolean; message: string; success?: boolean } | null>(null);

  const activeSession = api.getActiveSession();

  useEffect(() => {
    loadAllData();
    setGasUrlInput(api.getGasUrl());
  }, []);

  async function loadAllData() {
    setIsLoading(true);
    try {
      const [metricRes, contentRes, eventRes, mediaRes, catRes, subRes] = await Promise.all([
        api.getAdminMetrics(),
        api.getContentList({ status: 'all', limit: 50 }),
        api.getEvents(),
        api.getMediaAssets(),
        api.getCategories(),
        api.getSubcategories()
      ]);

      setMetrics(metricRes.data || null);
      setContentList(contentRes.data || []);
      setEventList(eventRes.data || []);
      setMediaList(mediaRes.data || []);
      setCategories(catRes.data || []);
      setSubcategories(subRes.data || []);
      if (metricRes.data?.recent_activity) {
        setAuditLogs(metricRes.data.recent_activity);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  // --- Handlers for Content ---
  const handleOpenCreateContent = () => {
    setEditingContent({
      title: '',
      description: '',
      category_id: 'lalakon',
      subcategory_id: 'sub_l1',
      subcategory_name: 'Cerita Rakyat',
      origin_province: 'Jawa Barat',
      origin_city: '',
      duration_seconds: 600,
      publication_status: 'draft',
      is_featured: false,
      credits: { director_or_teller: '', production_or_source: '', cultural_consultant: '', license: 'Arsip Budaya Nusantara' },
      tutorial_data: { equipment: ['Alat tradisional'], players_count: '2 orang', rules: ['Patuhi giliran'], instructions: ['Langkah 1'] }
    });
    setIsContentModalOpen(true);
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContent || !editingContent.title) return;

    try {
      const res = await api.saveContent(editingContent);
      if (res.success) {
        setIsContentModalOpen(false);
        setEditingContent(null);
        await loadAllData();
      } else {
        alert(res.error?.message || 'Gagal menyimpan konten');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan');
    }
  };

  const handleDeleteContent = async (contentId: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus metadata konten "${title}"? Berkas di Google Drive tidak akan terhapus.`)) {
      const res = await api.deleteContentMetadata(contentId);
      if (res.success) {
        await loadAllData();
      }
    }
  };

  const handleTogglePublicationStatus = async (item: ContentItem, newStatus: PublicationStatus) => {
    const res = await api.saveContent({ content_id: item.content_id, publication_status: newStatus });
    if (res.success) {
      await loadAllData();
    }
  };

  // --- Handlers for Events ---
  const handleOpenCreateEvent = () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
    setEditingEvent({
      title: '',
      description: '',
      category: 'Festival Budaya',
      province: 'Jawa Tengah',
      city: 'Surakarta',
      venue: '',
      address: '',
      start_datetime: now.toISOString().slice(0, 16),
      end_datetime: nextWeek.toISOString().slice(0, 16),
      organizer: '',
      verification_status: 'verified',
      publication_status: 'published',
      event_status: 'upcoming'
    });
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !editingEvent.title) return;

    try {
      const res = await api.saveEvent(editingEvent);
      if (res.success) {
        setIsEventModalOpen(false);
        setEditingEvent(null);
        await loadAllData();
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan pagelaran');
    }
  };

  // --- Handlers for Media ---
  const handleAssociateMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaAsset.drive_file_id) {
      alert('ID Berkas Google Drive wajib diisi.');
      return;
    }

    const res = await api.associateMediaAsset(newMediaAsset);
    if (res.success) {
      setIsMediaModalOpen(false);
      setNewMediaAsset({ drive_file_id: '', file_name: '', mime_type: 'video/mp4', asset_role: 'primary_media' });
      await loadAllData();
    }
  };

  // --- Test GAS Connection ---
  const handleTestGas = async () => {
    setPingStatus({ testing: true, message: 'Menghubungi endpoint Google Apps Script...' });
    const res = await api.testGasConnection(gasUrlInput);
    setPingStatus({ testing: false, message: res.message, success: res.success });
    if (res.success) {
      api.setGasUrl(gasUrlInput);
    }
  };

  const handleSaveGasUrl = () => {
    api.setGasUrl(gasUrlInput);
    alert('URL Google Apps Script berhasil disimpan!');
  };

  const isLive = api.isUsingLiveGas();

  return (
    <div className="min-h-screen bg-[#F8F3E9] text-[#292522]">
      {/* Admin Header */}
      <header className="bg-white border-b border-[#E5DED2] sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" showDescriptor={false} />
            <div className="h-5 w-px bg-[#E5DED2]" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#800020]/10 text-[#800020]">
              CMS Kurator Budaya
            </span>
            <span className={`text-[11px] px-2 py-0.5 rounded font-mono ${isLive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {isLive ? '● Live GAS Connected' : '○ Mode Pratinjau Lokal'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={onViewPublicSite}
              className="text-[#6D675F] hover:text-[#292522] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5DED2] bg-[#F8F3E9]"
            >
              <Eye className="w-3.5 h-3.5 text-[#800020]" />
              <span className="hidden sm:inline">Pratinjau Publik</span>
            </button>

            <div className="hidden md:flex flex-col text-right">
              <span className="font-semibold text-[#292522] leading-none">
                {activeSession?.display_name || 'Administrator'}
              </span>
              <span className="text-[10px] text-[#8E867B]">{activeSession?.email}</span>
            </div>

            <button
              onClick={onLogout}
              className="text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition-colors"
              title="Keluar Sesi"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto text-xs font-medium border-t border-[#F1ECE0]">
          {[
            { id: 'overview' as AdminTab, label: 'Ikhtisar', icon: LayoutDashboard },
            { id: 'site_config' as AdminTab, label: 'Pengaturan Tampilan & Konten Website', icon: Palette },
            { id: 'content' as AdminTab, label: 'Koleksi Konten', icon: Film, count: contentList.length },
            { id: 'events' as AdminTab, label: 'Pagelaran Budaya', icon: Calendar, count: eventList.length },
            { id: 'media' as AdminTab, label: 'Media Google Drive', icon: FolderOpen, count: mediaList.length },
            { id: 'categories' as AdminTab, label: 'Kategori & Subkategori', icon: Tags },
            { id: 'settings' as AdminTab, label: 'Pengaturan & Integrasi GAS', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3.5 border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[#800020] text-[#800020] font-bold'
                    : 'border-transparent text-[#6D675F] hover:text-[#292522]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? 'bg-[#800020] text-white' : 'bg-[#E5DED2] text-[#6D675F]'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ===================== TAB: OVERVIEW ===================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 rounded-2xl bg-white border border-[#E5DED2] shadow-sm space-y-2">
                <span className="text-xs text-[#6D675F] font-medium block">Total Konten Publikasi</span>
                <p className="font-serif font-bold text-3xl text-[#800020] tabular-nums">
                  {metrics?.total_published ?? contentList.filter(c => c.publication_status === 'published').length}
                </p>
                <p className="text-[11px] text-[#8E867B]">Telah tayang untuk publik</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5DED2] shadow-sm space-y-2">
                <span className="text-xs text-[#6D675F] font-medium block">Draf & Dalam Kurasi</span>
                <p className="font-serif font-bold text-3xl text-amber-800 tabular-nums">
                  {metrics?.total_drafts ?? contentList.filter(c => c.publication_status === 'draft').length}
                </p>
                <p className="text-[11px] text-[#8E867B]">Belum dipublikasikan</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5DED2] shadow-sm space-y-2">
                <span className="text-xs text-[#6D675F] font-medium block">Berkas Google Drive</span>
                <p className="font-serif font-bold text-3xl text-[#1B3A2F] tabular-nums">
                  {mediaList.length}
                </p>
                <p className="text-[11px] text-[#8E867B]">Tautan aset terhubung</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5DED2] shadow-sm space-y-2">
                <span className="text-xs text-[#6D675F] font-medium block">Pagelaran Mendatang</span>
                <p className="font-serif font-bold text-3xl text-[#C65D3A] tabular-nums">
                  {eventList.filter(e => e.event_status === 'upcoming').length}
                </p>
                <p className="text-[11px] text-[#8E867B]">Agenda aktif terjadwal</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5DED2] shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-serif font-bold text-base text-[#292522]">Tindakan Cepat Kurator</h3>
                <p className="text-xs text-[#6D675F]">Ubah tema & konten tampilan, tambah materi budaya, atau kelola agenda perhelatan daerah.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveTab('site_config')}
                  className="px-4 py-2 bg-[var(--color-maroon,#800020)] hover:bg-[var(--color-maroon-deep,#590018)] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5 text-[var(--color-gold,#D4A373)]" /> Tampilan & Konten Website
                </button>
                <button
                  onClick={handleOpenCreateContent}
                  className="px-4 py-2 bg-[#800020] hover:bg-[#590018] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Konten Budaya
                </button>
                <button
                  onClick={handleOpenCreateEvent}
                  className="px-4 py-2 bg-[#1B3A2F] hover:bg-[#122820] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Pagelaran
                </button>
                <button
                  onClick={() => setIsMediaModalOpen(true)}
                  className="px-4 py-2 bg-[#F1ECE0] hover:bg-[#E5DED2] text-[#292522] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-[#E5DED2] cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-[#800020]" /> Hubungkan Berkas Drive
                </button>
              </div>
            </div>

            {/* Recent Audit Log */}
            <div className="bg-white rounded-2xl border border-[#E5DED2] shadow-sm overflow-hidden">
              <div className="p-5 border-b border-[#F1ECE0] flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#292522]">Catatan Audit Aktivitas (AUDIT_LOG)</h3>
                  <p className="text-xs text-[#8E867B]">Setiap tindakan kurator dicatat secara permanen di Google Sheets.</p>
                </div>
                <button
                  onClick={loadAllData}
                  className="p-1.5 text-[#6D675F] hover:text-[#292522] rounded-lg border border-[#E5DED2]"
                  title="Segarkan Log"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F3E9] text-[#6D675F] border-b border-[#E5DED2]">
                    <tr>
                      <th className="p-3 font-semibold">Waktu</th>
                      <th className="p-3 font-semibold">Administrator</th>
                      <th className="p-3 font-semibold">Aksi</th>
                      <th className="p-3 font-semibold">Sumber Daya</th>
                      <th className="p-3 font-semibold">Hasil</th>
                      <th className="p-3 font-semibold">Rincian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1ECE0]">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-[#8E867B]">
                          Belum ada aktivitas tercatat.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.log_id} className="hover:bg-[#F8F3E9]/50">
                          <td className="p-3 font-mono text-[11px] text-[#6D675F] tabular-nums whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString('id-ID')}
                          </td>
                          <td className="p-3 font-medium text-[#292522] truncate max-w-[150px]">{log.admin_email}</td>
                          <td className="p-3 font-mono text-[11px] text-[#800020] font-semibold">{log.action}</td>
                          <td className="p-3 text-[#6D675F]">{log.resource_type}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.result === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {log.result}
                            </span>
                          </td>
                          <td className="p-3 text-[#6D675F] truncate max-w-xs">{log.details || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: CONTENT MANAGEMENT ===================== */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif font-bold text-2xl text-[#292522]">Manajemen Koleksi Konten</h2>
                <p className="text-xs text-[#6D675F]">Kelola judul, kategori, durasi, dan publikasi cerita rakyat serta audio.</p>
              </div>
              <button
                onClick={handleOpenCreateContent}
                className="px-4 py-2 bg-[#800020] hover:bg-[#590018] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Konten Baru
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5DED2] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F3E9] text-[#6D675F] border-b border-[#E5DED2]">
                    <tr>
                      <th className="p-3 font-semibold">Judul Konten</th>
                      <th className="p-3 font-semibold">Kategori</th>
                      <th className="p-3 font-semibold">Daerah Asal</th>
                      <th className="p-3 font-semibold">Durasi</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1ECE0]">
                    {contentList.map((item) => (
                      <tr key={item.content_id} className="hover:bg-[#F8F3E9]/50">
                        <td className="p-3">
                          <p className="font-semibold text-[#292522] line-clamp-1">{item.title}</p>
                          <p className="text-[11px] text-[#8E867B] font-mono">{item.slug}</p>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-medium capitalize text-[#800020]">{item.category_id}</span>
                          <span className="text-[11px] text-[#8E867B] block">{item.subcategory_name}</span>
                        </td>
                        <td className="p-3 whitespace-nowrap text-[#292522]">{item.origin_province}</td>
                        <td className="p-3 whitespace-nowrap font-mono tabular-nums text-[#6D675F]">
                          {Math.floor(item.duration_seconds / 60)} mnt
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            item.publication_status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.publication_status === 'draft'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}>
                            {item.publication_status === 'published' ? 'Tayang' : item.publication_status === 'draft' ? 'Draf' : 'Diarsipkan'}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditingContent(item);
                              setIsContentModalOpen(true);
                            }}
                            className="p-1.5 text-[#6D675F] hover:text-[#800020] rounded hover:bg-[#F1ECE0]"
                            title="Sunting Konten"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {item.publication_status === 'published' ? (
                            <button
                              onClick={() => handleTogglePublicationStatus(item, 'draft')}
                              className="px-2 py-1 text-[10px] font-medium text-amber-800 bg-amber-50 rounded hover:bg-amber-100"
                              title="Tarik ke Draf"
                            >
                              Jadikan Draf
                            </button>
                          ) : (
                            <button
                              onClick={() => handleTogglePublicationStatus(item, 'published')}
                              className="px-2 py-1 text-[10px] font-medium text-emerald-800 bg-emerald-50 rounded hover:bg-emerald-100"
                              title="Publikasikan"
                            >
                              Publikasikan
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteContent(item.content_id, item.title)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 rounded hover:bg-rose-50"
                            title="Hapus Metadata"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: PAGELARAN EVENTS ===================== */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif font-bold text-2xl text-[#292522]">Manajemen Pagelaran Budaya</h2>
                <p className="text-xs text-[#6D675F]">Kelola jadwal festival, eksibisi, upacara adat, serta tautan tiket resmi.</p>
              </div>
              <button
                onClick={handleOpenCreateEvent}
                className="px-4 py-2 bg-[#1B3A2F] hover:bg-[#122820] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Pagelaran Baru
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5DED2] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F3E9] text-[#6D675F] border-b border-[#E5DED2]">
                    <tr>
                      <th className="p-3 font-semibold">Nama Pagelaran</th>
                      <th className="p-3 font-semibold">Kategori</th>
                      <th className="p-3 font-semibold">Tanggal Mulai</th>
                      <th className="p-3 font-semibold">Lokasi</th>
                      <th className="p-3 font-semibold">Status Waktu</th>
                      <th className="p-3 font-semibold text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1ECE0]">
                    {eventList.map((ev) => (
                      <tr key={ev.event_id} className="hover:bg-[#F8F3E9]/50">
                        <td className="p-3">
                          <p className="font-semibold text-[#292522]">{ev.title}</p>
                          <p className="text-[11px] text-[#8E867B]">{ev.organizer}</p>
                        </td>
                        <td className="p-3 whitespace-nowrap text-[#800020] font-medium">{ev.category}</td>
                        <td className="p-3 whitespace-nowrap font-mono tabular-nums text-[#6D675F]">
                          {new Date(ev.start_datetime).toLocaleDateString('id-ID')}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span>{ev.city}, {ev.province}</span>
                          <span className="text-[11px] text-[#8E867B] block truncate max-w-xs">{ev.venue}</span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            ev.event_status === 'upcoming'
                              ? 'bg-[#800020]/10 text-[#800020]'
                              : ev.event_status === 'ongoing'
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}>
                            {ev.event_status}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditingEvent(ev);
                              setIsEventModalOpen(true);
                            }}
                            className="p-1.5 text-[#6D675F] hover:text-[#800020] rounded hover:bg-[#F1ECE0]"
                            title="Sunting Pagelaran"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: MEDIA LIBRARY (GOOGLE DRIVE) ===================== */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif font-bold text-2xl text-[#292522]">Pustaka Media Google Drive</h2>
                <p className="text-xs text-[#6D675F]">Penyimpanan aset video, rekaman audio, dan berkas poster pada Google Drive.</p>
              </div>
              <button
                onClick={() => setIsMediaModalOpen(true)}
                className="px-4 py-2 bg-[#800020] hover:bg-[#590018] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" /> Hubungkan File Drive Baru
              </button>
            </div>

            {/* Google Drive Folder Structure Recommendation Banner */}
            <div className="p-5 bg-white rounded-2xl border border-[#D4A373]/40 shadow-sm space-y-3">
              <h3 className="font-serif font-bold text-sm text-[#800020] uppercase tracking-wider flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-[#D4A373]" />
                <span>Rekomendasi Struktur Folder Google Drive (Prompt Seksi 15)</span>
              </h3>
              <p className="text-xs text-[#6D675F]">
                Untuk tata kelola penyimpanan jangka panjang, atur folder Google Drive Anda dengan hierarki berikut:
              </p>
              <div className="p-3.5 bg-[#F8F3E9] rounded-xl font-mono text-xs text-[#292522] border border-[#E5DED2] space-y-1">
                <div className="font-bold text-[#800020]">ADARUPA_MEDIA/</div>
                <div className="pl-4">├── 01_LALAKON/ <span className="text-[#8E867B] font-sans">(Video film cerita rakyat, legenda & dokumenter)</span></div>
                <div className="pl-4">├── 02_GEMA_SWARA/ <span className="text-[#8E867B] font-sans">(File MP3 audio dongeng & sandiwara radio)</span></div>
                <div className="pl-4">├── 03_GELANGGANG/ <span className="text-[#8E867B] font-sans">(Video panduan dan aturan permainan tradisional)</span></div>
                <div className="pl-4">├── 04_PAGELARAN/ <span className="text-[#8E867B] font-sans">(Poster dan dokumen jadwal festival budaya)</span></div>
                <div className="pl-4">└── 05_BRANDING/ <span className="text-[#8E867B] font-sans">(Logo resmi ADARUPA & aset grafis identitas)</span></div>
              </div>
            </div>

            {/* Media Table */}
            <div className="bg-white rounded-2xl border border-[#E5DED2] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F3E9] text-[#6D675F] border-b border-[#E5DED2]">
                    <tr>
                      <th className="p-3 font-semibold">Nama Berkas</th>
                      <th className="p-3 font-semibold">Google Drive File ID</th>
                      <th className="p-3 font-semibold">Tipe MIME</th>
                      <th className="p-3 font-semibold">Peran Aset</th>
                      <th className="p-3 font-semibold">Status Ketersediaan</th>
                      <th className="p-3 font-semibold text-right">Tautan Langsung</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1ECE0]">
                    {mediaList.map((m) => (
                      <tr key={m.media_asset_id} className="hover:bg-[#F8F3E9]/50">
                        <td className="p-3 font-medium text-[#292522]">{m.file_name}</td>
                        <td className="p-3 font-mono text-[11px] text-[#6D675F]">{m.drive_file_id}</td>
                        <td className="p-3 font-mono text-[11px] text-[#8E867B]">{m.mime_type}</td>
                        <td className="p-3 text-[#800020] font-medium">{m.asset_role}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {m.availability_status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <a
                            href={`https://drive.google.com/file/d/${m.drive_file_id}/view`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#800020] hover:underline inline-flex items-center gap-1 font-semibold"
                          >
                            <span>Buka Drive</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: CATEGORIES ===================== */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif font-bold text-2xl text-[#292522]">Struktur Kategori & Subkategori</h2>
              <p className="text-xs text-[#6D675F]">
                Sesuai aturan produk ADARUPA, empat kategori utama (Lalakon, Gema Swara, Gelanggang, Pagelaran) bersifat baku.
              </p>
            </div>

            {/* 4 Core Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((c) => (
                <div key={c.category_id} className="p-5 bg-white rounded-2xl border border-[#E5DED2] shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#800020] uppercase font-bold">Urutan {c.display_order}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">Resmi</span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#292522]">{c.name}</h3>
                  <p className="text-xs text-[#6D675F] leading-relaxed">{c.description}</p>
                </div>
              ))}
            </div>

            {/* Subcategories list */}
            <div className="bg-white rounded-2xl border border-[#E5DED2] shadow-sm p-6 space-y-4">
              <h3 className="font-serif font-bold text-base text-[#292522]">Daftar Subkategori Terdaftar ({subcategories.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {subcategories.map((sub) => (
                  <div key={sub.subcategory_id} className="p-3 bg-[#F8F3E9] rounded-xl border border-[#E5DED2] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-[#292522] block">{sub.name}</span>
                      <span className="text-[10px] text-[#800020] capitalize">{sub.category_id}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">Aktif</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: SETTINGS & GAS INTEGRATION ===================== */}
        {activeTab === 'settings' && (
          <div className="space-y-8 max-w-4xl">
            <div>
              <h2 className="font-serif font-bold text-2xl text-[#292522]">Pengaturan & Integrasi Backend</h2>
              <p className="text-xs text-[#6D675F]">
                Konfigurasi URL Google Apps Script Web App dan integrasi Google Sheets.
              </p>
            </div>

            {/* Google Apps Script Endpoint Config Box */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5DED2] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#292522]">URL Google Apps Script Web App</h3>
                  <p className="text-xs text-[#6D675F]">
                    Masukkan URL Web App hasil deploy Apps Script Anda (format: https://script.google.com/macros/s/.../exec).
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  isLive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isLive ? 'Terhubung ke Google Apps Script' : 'Mode Pratinjau Lokal'}
                </span>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={gasUrlInput}
                  onChange={(e) => setGasUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="w-full p-2.5 bg-[#F8F3E9] border border-[#E5DED2] rounded-xl text-xs sm:text-sm font-mono text-[#292522] focus:outline-none focus:ring-2 focus:ring-[#800020]"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleTestGas}
                  className="px-4 py-2 bg-[#1B3A2F] hover:bg-[#122820] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${pingStatus?.testing ? 'animate-spin' : ''}`} />
                  <span>Uji Koneksi Backend</span>
                </button>

                <button
                  onClick={handleSaveGasUrl}
                  className="px-4 py-2 bg-[#800020] hover:bg-[#590018] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan URL</span>
                </button>
              </div>

              {pingStatus && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  pingStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {pingStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                  <span>{pingStatus.message}</span>
                </div>
              )}
            </div>

            {/* Google Sheets Initialization Guide */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5DED2] shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-base text-[#800020]">
                Panduan Inisialisasi Google Sheets Otomatis
              </h3>
              <p className="text-xs text-[#6D675F] leading-relaxed">
                Source code lengkap backend telah disediakan pada folder <code className="bg-[#F8F3E9] px-1.5 py-0.5 rounded font-mono text-[#800020]">gas-backend/</code> di dalam repositori ini.
              </p>
              <ol className="list-decimal list-inside space-y-2 text-xs text-[#292522]">
                <li>Buka Google Drive dan buat satu spreadsheet baru bernama <strong>ADARUPA_DATABASE</strong>.</li>
                <li>Salin ID Spreadsheet dari URL (contoh: <code className="bg-[#F8F3E9] px-1 py-0.5 rounded font-mono">1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms</code>).</li>
                <li>Buka menu <strong>Ekstensi &gt; Apps Script</strong>.</li>
                <li>Unggah atau salin 10 berkas dari direktori <code className="bg-[#F8F3E9] px-1 py-0.5 rounded font-mono">gas-backend/</code>:
                  <span className="block pl-4 text-[#6D675F] font-mono mt-1">
                    Main.gs, Router.gs, ContentService.gs, EventService.gs, MediaService.gs, AuthService.gs, CategoryService.gs, SettingsService.gs, Validation.gs, Utilities.gs
                  </span>
                </li>
                <li>Buka <strong>Project Settings &gt; Script Properties</strong>, tambahkan property <code className="font-mono text-[#800020]">SPREADSHEET_ID</code> dengan ID spreadsheet Anda.</li>
                <li>Jalankan fungsi <code className="font-mono text-[#800020]">Utilities_gs.setupAdarupaSheets()</code> sekali untuk menginisialisasi 9 sheet dan kategori resmi secara otomatis!</li>
                <li>Deploy sebagai <strong>Web App</strong> (Execute as: <em>Me</em>, Who has access: <em>Anyone</em>), lalu salin URL Web App ke kolom di atas.</li>
              </ol>
            </div>
          </div>
        )}

        {/* ===================== TAB: PENGATURAN TAMPILAN & KONTEN WEBSITE (CMS) ===================== */}
        {activeTab === 'site_config' && (
          <SiteConfigManager onPreviewPublicSite={onViewPublicSite} />
        )}
      </main>

      {/* ===================== MODAL: CREATE / EDIT CONTENT ===================== */}
      {isContentModalOpen && editingContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 border border-[#E5DED2] shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1ECE0]">
              <h3 className="font-serif font-bold text-lg text-[#292522]">
                {editingContent.content_id ? 'Sunting Konten Budaya' : 'Tambah Konten Baru'}
              </h3>
              <button
                onClick={() => setIsContentModalOpen(false)}
                className="p-1 text-[#8E867B] hover:text-[#292522]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContent} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#292522]">Judul Konten *</label>
                <input
                  type="text"
                  required
                  value={editingContent.title || ''}
                  onChange={(e) => setEditingContent({ ...editingContent, title: e.target.value })}
                  placeholder="misal: Legenda Sangkuriang & Tangkuban Parahu"
                  className="w-full p-2.5 bg-[#F8F3E9] border border-[#E5DED2] rounded-xl text-xs text-[#292522]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[#292522]">Kategori Utama *</label>
                  <select
                    value={editingContent.category_id || 'lalakon'}
                    onChange={(e) => setEditingContent({ ...editingContent, category_id: e.target.value as MainCategorySlug })}
                    className="w-full p-2.5 bg-[#F8F3E9] border border-[#E5DED2] rounded-xl text-xs text-[#292522]"
                  >
                    <option value="lalakon">Lalakon (Film & Tutur Visual)</option>
                    <option value="gema-swara">Gema Swara (Audio & Sandiwara)</option>
                    <option value="gelanggang">Gelanggang (Permainan Tradisional)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#292522]">Provinsi Asal *</label>
                  <input
                    type="text"
                    required
                    value={editingContent.origin_province || ''}
                    onChange={(e) => setEditingContent({ ...editingContent, origin_province: e.target.value })}
                    placeholder="misal: Jawa Barat"
                    className="w-full p-2.5 bg-[#F8F3E9] border border-[#E5DED2] rounded-xl text-xs text-[#292522]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#292522]">Deskripsi Narasi *</label>
                <textarea
                  rows={3}
                  required
                  value={editingContent.description || ''}
                  onChange={(e) => setEditingContent({ ...editingContent, description: e.target.value })}
                  placeholder="Kisah tutur kearifan lokal..."
                  className="w-full p-2.5 bg-[#F8F3E9] border border-[#E5DED2] rounded-xl text-xs text-[#292522]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[#292522]">Durasi (Detik)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingContent.duration_seconds ?? 0}
                    onChange={(e) => setEditingContent({ ...editingContent, duration_seconds: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2.5 bg-[#F8F3E9] border border-[#E5DED2] rounded-xl text-xs text-[#292522]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#292522]">Tautan Media (video/audio/gambar)</label>
                  <input
                    type="url"
                    value={editingContent.media_url || ''}
                    onChange={(e) => setEditingContent({ ...editingContent, media_url: e.target.value })}
                    placeholder="https://youtu.be/... atau URL file publik"
                    className="w-full p-2.5 bg-[#F8F3E9] border border-[#E5DED2] rounded-xl text-xs text-[#292522]"
                  />
                  <p className="text-[11px] text-[#6D675F]">Tempel URL sumber. Video YouTube akan diputar melalui embed; URL file langsung harus bisa diakses publik.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[#292522]">URL Thumbnail / Sampul (opsional)</label>
                  <input
                    type="url"
                    value={editingContent.cover_url || ''}
                    onChange={(e) => setEditingContent({ ...editingContent, cover_url: e.target.value })}
                    placeholder="https://.../thumbnail.jpg"
                    className="w-full p-2.5 bg-[#F8F3E9] border border-[#E5DED2] rounded-xl text-xs text-[#292522]"
                  />
                  <p className="text-[11px] text-[#6D675F]">Gunakan URL gambar langsung. Jika kosong, thumbnail YouTube akan dicoba otomatis.</p>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#292522]">ID Berkas Google Drive (opsional)</label>
                  <input
                    type="text"
                    value={editingContent.drive_file_id || ''}
                    onChange={(e) => setEditingContent({ ...editingContent, drive_file_id: e.target.value })}
                    placeholder="ID file Drive (bukan URL folder)"
                    className="w-full p-2.5 bg-[#F8F3E9] border border-[#E5DED2] rounded-xl text-xs text-[#292522] font-mono"
                  />
                </div>
              </div>

              {(() => {
                const source = String(editingContent.media_url || '').trim();
                const cover = String(editingContent.cover_url || '').trim();
                const yt = source.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/i);
                const drive = String(editingContent.drive_file_id || '').trim();
                const preview = cover || (yt ? `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg` : (drive ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(drive)}&sz=w800` : ''));
                return preview ? (
                  <div className="rounded-xl border border-[#E5DED2] bg-[#FCFAF5] p-3 space-y-2">
                    <span className="font-semibold text-[#292522]">Pratinjau thumbnail</span>
                    <img src={preview} alt="Pratinjau thumbnail konten" className="max-h-48 w-auto max-w-full rounded-lg object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    <a href={preview} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#800020] underline">Buka gambar <ExternalLink className="w-3 h-3" /></a>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#6D675F]">Pratinjau muncul setelah URL sampul, URL YouTube, atau ID file Drive diisi.</p>
                );
              })()}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[#292522]">Status Publikasi</label>
                  <select
                    value={editingContent.publication_status || 'draft'}
                    onChange={(e) => setEditingContent({ ...editingContent, publication_status: e.target.value as PublicationStatus })}
                    className="w-full p-2.5 bg-[#F8F3E9] border border-[#E5DED2] rounded-xl text-xs text-[#292522]"
                  >
                    <option value="draft">Draf (Belum Tayang)</option>
                    <option value="published">Publikasi Resmi</option>
                    <option value="archived">Diarsipkan</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={Boolean(editingContent.is_featured)}
                    onChange={(e) => setEditingContent({ ...editingContent, is_featured: e.target.checked })}
                    className="w-4 h-4 accent-[#800020] rounded"
                  />
                  <label htmlFor="is_featured" className="font-semibold text-[#292522] cursor-pointer">
                    Tampilkan di Pilihan Unggulan Beranda
                  </label>
                </div>
              </div>

              {/* Attribution */}
              <div className="pt-2 border-t border-[#F1ECE0] space-y-2">
                <span className="font-semibold text-[#800020] block">Atribusi dan Lisensi Budaya</span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={editingContent.credits?.director_or_teller || ''}
                    onChange={(e) => setEditingContent({
                      ...editingContent,
                      credits: { ...editingContent.credits, director_or_teller: e.target.value }
                    })}
                    placeholder="Sutradara / Penutur"
                    className="p-2 bg-[#F8F3E9] border border-[#E5DED2] rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={editingContent.credits?.production_or_source || ''}
                    onChange={(e) => setEditingContent({
                      ...editingContent,
                      credits: { ...editingContent.credits, production_or_source: e.target.value }
                    })}
                    placeholder="Sanggar / Rumah Produksi"
                    className="p-2 bg-[#F8F3E9] border border-[#E5DED2] rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#F1ECE0] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsContentModalOpen(false)}
                  className="px-4 py-2 border border-[#E5DED2] rounded-lg text-xs text-[#6D675F] hover:bg-[#F1ECE0]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#800020] hover:bg-[#590018] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" /> Simpan Metadata Konten
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: CREATE / EDIT EVENT ===================== */}
      {isEventModalOpen && editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 border border-[#E5DED2] shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1ECE0]">
              <h3 className="font-serif font-bold text-lg text-[#292522]">
                {editingEvent.event_id ? 'Sunting Pagelaran' : 'Tambah Pagelaran Baru'}
              </h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 text-[#8E867B] hover:text-[#292522]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#292522]">Nama Pagelaran *</label>
                <input
                  type="text"
                  required
                  value={editingEvent.title || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  placeholder="misal: Festival Payung Indonesia 2026"
                  className="w-full p-2.5 bg-[#F8F3E9] border border-[#E5DED2] rounded-xl text-xs text-[#292522]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[#292522]">Kategori Pagelaran</label>
                  <select
                    value={editingEvent.category || 'Festival Budaya'}
                    onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value as any })}
                    className="w-full p-2.5 bg-[#F8F3E9] border border-[#E5DED2] rounded-xl text-xs text-[#292522]"
                  >
                    <option value="Festival Budaya">Festival Budaya</option>
                    <option value="Pertunjukan Seni">Pertunjukan Seni</option>
                    <option value="Pameran Budaya">Pameran Budaya</option>
                    <option value="Upacara Adat">Upacara Adat</option>
                    <option value="Lokakarya dan Edukasi">Lokakarya dan Edukasi</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#292522]">Penyelenggara *</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.organizer || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, organizer: e.target.value })}
                    placeholder="misal: Dinas Kebudayaan Surakarta"
                    className="w-full p-2.5 bg-[#F8F3E9] border border-[#E5DED2] rounded-xl text-xs text-[#292522]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[#292522]">Provinsi</label>
                  <input
                    type="text"
                    value={editingEvent.province || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, province: e.target.value })}
                    className="w-full p-2.5 bg-[#F8F3E9] border border-[#E5DED2] rounded-xl text-xs text-[#292522]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#292522]">Kota / Kabupaten</label>
                  <input
                    type="text"
                    value={editingEvent.city || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, city: e.target.value })}
                    className="w-full p-2.5 bg-[#F8F3E9] border border-[#E5DED2] rounded-xl text-xs text-[#292522]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#292522]">Lokasi / Tempat Pertunjukan *</label>
                <input
                  type="text"
                  required
                  value={editingEvent.venue || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                  placeholder="misal: Pura Mangkunegaran & Taman Balekambang"
                  className="w-full p-2.5 bg-[#F8F3E9] border border-[#E5DED2] rounded-xl text-xs text-[#292522]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#292522]">Deskripsi Acara</label>
                <textarea
                  rows={2}
                  value={editingEvent.description || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full p-2.5 bg-[#F8F3E9] border border-[#E5DED2] rounded-xl text-xs text-[#292522]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[#292522]">Waktu Mulai</label>
                  <input
                    type="datetime-local"
                    value={editingEvent.start_datetime?.slice(0, 16) || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, start_datetime: e.target.value })}
                    className="w-full p-2 bg-[#F8F3E9] border border-[#E5DED2] rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#292522]">Waktu Selesai</label>
                  <input
                    type="datetime-local"
                    value={editingEvent.end_datetime?.slice(0, 16) || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, end_datetime: e.target.value })}
                    className="w-full p-2 bg-[#F8F3E9] border border-[#E5DED2] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#F1ECE0] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 border border-[#E5DED2] rounded-lg text-xs text-[#6D675F]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B3A2F] hover:bg-[#122820] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" /> Simpan Pagelaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: ASSOCIATE GOOGLE DRIVE ASSET ===================== */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#E5DED2] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1ECE0]">
              <h3 className="font-serif font-bold text-base text-[#292522]">Hubungkan File Google Drive</h3>
              <button onClick={() => setIsMediaModalOpen(false)} className="p-1 text-[#8E867B] hover:text-[#292522]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssociateMedia} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#292522]">Google Drive File ID *</label>
                <input
                  type="text"
                  required
                  value={newMediaAsset.drive_file_id || ''}
                  onChange={(e) => setNewMediaAsset({ ...newMediaAsset, drive_file_id: e.target.value.trim() })}
                  placeholder="misal: 1aB2c3D4e5F6g7H8i9J0kL"
                  className="w-full p-2.5 bg-[#F8F3E9] border border-[#E5DED2] rounded-xl font-mono text-xs text-[#292522]"
                />
                <p className="text-[11px] text-[#8E867B]">
                  Pastikan izin berkas di Drive telah diatur ke: "Siapa saja yang memiliki tautan dapat melihat".
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#292522]">Nama Berkas</label>
                <input
                  type="text"
                  value={newMediaAsset.file_name || ''}
                  onChange={(e) => setNewMediaAsset({ ...newMediaAsset, file_name: e.target.value })}
                  placeholder="misal: sangkuriang_master_1080p.mp4"
                  className="w-full p-2.5 bg-[#F8F3E9] border border-[#E5DED2] rounded-xl text-xs text-[#292522]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#292522]">Tipe MIME</label>
                  <select
                    value={newMediaAsset.mime_type || 'video/mp4'}
                    onChange={(e) => setNewMediaAsset({ ...newMediaAsset, mime_type: e.target.value })}
                    className="w-full p-2 bg-[#F8F3E9] border border-[#E5DED2] rounded-xl text-xs"
                  >
                    <option value="video/mp4">video/mp4</option>
                    <option value="audio/mpeg">audio/mpeg (MP3)</option>
                    <option value="image/jpeg">image/jpeg</option>
                    <option value="image/png">image/png</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#292522]">Peran Aset</label>
                  <select
                    value={newMediaAsset.asset_role || 'primary_media'}
                    onChange={(e) => setNewMediaAsset({ ...newMediaAsset, asset_role: e.target.value as any })}
                    className="w-full p-2 bg-[#F8F3E9] border border-[#E5DED2] rounded-xl text-xs"
                  >
                    <option value="primary_media">Media Utama</option>
                    <option value="cover">Sampul / Poster</option>
                    <option value="attachment">Lampiran</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F1ECE0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(false)}
                  className="px-4 py-2 border border-[#E5DED2] rounded-lg text-xs text-[#6D675F]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#800020] text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Simpan Tautan Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
