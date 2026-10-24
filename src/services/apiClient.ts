import {
  ApiResponse,
  Category,
  Subcategory,
  ContentItem,
  CulturalEvent,
  AdminSession,
  MediaAsset,
  AuditLogEntry,
  AppSettings,
  SiteConfig,
  ConfigHistorySnapshot
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_SUBCATEGORIES,
  INITIAL_CONTENT,
  INITIAL_EVENTS,
  INITIAL_MEDIA_ASSETS,
  INITIAL_ADMINS,
  DEFAULT_APP_SETTINGS,
  DEFAULT_SITE_CONFIG
} from '../data/culturalData';

const STORAGE_KEYS = {
  GAS_URL: 'adarupa_gas_url',
  CONTENT: 'adarupa_content_db',
  EVENTS: 'adarupa_events_db',
  MEDIA: 'adarupa_media_db',
  CATEGORIES: 'adarupa_categories_db',
  SUBCATEGORIES: 'adarupa_subcategories_db',
  AUDIT_LOG: 'adarupa_audit_log',
  SESSION: 'adarupa_admin_session',
  SETTINGS: 'adarupa_settings',
  TEST_MAILBOX: 'adarupa_test_mailbox', // For local dev OTP inspection
  PUBLISHED_SITE_CONFIG: 'adarupa_published_site_config',
  DRAFT_SITE_CONFIG: 'adarupa_draft_site_config',
  CONFIG_HISTORY: 'adarupa_config_history'
};

class ApiClient {
  private gasUrl: string = '';

  constructor() {
    this.initStorage();
    // Prioritas: URL yang disimpan admin > environment variable Vercel > URL GAS ADARUPA.
    this.gasUrl =
      localStorage.getItem(STORAGE_KEYS.GAS_URL) ||
      (import.meta as any).env?.VITE_GAS_API_URL ||
      'https://script.google.com/macros/s/AKfycbx7pX1eaIyyc6GyT1DnfkxLlLttFZrHuZ5QlrouudRfKOcRogGEKyry0kqpYjIvIpBODw/exec';
  }

  private initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.CONTENT)) {
      localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(INITIAL_CONTENT));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEDIA)) {
      localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(INITIAL_MEDIA_ASSETS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUBCATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.SUBCATEGORIES, JSON.stringify(INITIAL_SUBCATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOG)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify([
        {
          log_id: 'log_init',
          admin_id: 'adm_01',
          admin_email: '4ghina@gmail.com',
          action: 'SYSTEM_BOOTSTRAP',
          resource_type: 'SYSTEM',
          resource_id: 'adarupa_v1',
          timestamp: new Date().toISOString(),
          result: 'success',
          details: 'Inisialisasi metadata awal Nusantara'
        }
      ]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_APP_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PUBLISHED_SITE_CONFIG)) {
      localStorage.setItem(STORAGE_KEYS.PUBLISHED_SITE_CONFIG, JSON.stringify(DEFAULT_SITE_CONFIG));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DRAFT_SITE_CONFIG)) {
      localStorage.setItem(STORAGE_KEYS.DRAFT_SITE_CONFIG, JSON.stringify(DEFAULT_SITE_CONFIG));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONFIG_HISTORY)) {
      localStorage.setItem(STORAGE_KEYS.CONFIG_HISTORY, JSON.stringify([
        {
          historyId: 'hist_v1_init',
          version: 1,
          publishedAt: new Date().toISOString(),
          publishedBy: 'Sistem Inisialisasi ADARUPA',
          summary: 'Inisialisasi Versi 1 Konfigurasi Baku ADARUPA',
          configSnapshot: DEFAULT_SITE_CONFIG
        }
      ]));
    }
  }

  public getGasUrl(): string {
    return this.gasUrl;
  }

  public setGasUrl(url: string): void {
    this.gasUrl = url.trim();
    localStorage.setItem(STORAGE_KEYS.GAS_URL, this.gasUrl);
  }

  public isUsingLiveGas(): boolean {
    return Boolean(this.gasUrl && this.gasUrl.startsWith('https://script.google.com/macros/s/'));
  }

  // --- Generic HTTP Transport to Google Apps Script ---
  private async callGas<T>(action: string, method: 'GET' | 'POST' = 'GET', data?: any): Promise<ApiResponse<T>> {
    try {
      if (!this.gasUrl) {
        throw new Error('URL Google Apps Script belum dikonfigurasi');
      }

      // GET harus menyertakan parameter di URL. Sebelumnya data GET diabaikan,
      // sehingga categoryId, slug, pencarian, filter, dan pagination tidak terkirim.
      const query = new URLSearchParams();
      query.set('action', action);

      if (method === 'GET' && data && typeof data === 'object') {
        Object.keys(data).forEach((key) => {
          const value = data[key];
          if (value !== undefined && value !== null && value !== '') {
            query.set(key, String(value));
          }
        });
      }

      const separator = this.gasUrl.includes('?') ? '&' : '?';
      const url = `${this.gasUrl}${separator}${query.toString()}`;
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'text/plain;charset=utf-8' // GAS accepts text/plain to avoid pre-flight CORS blocks
        },
        redirect: 'follow'
      };

      if (method === 'POST') {
        options.body = JSON.stringify({ action, ...(data || {}) });
      }

      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      return json;
    } catch (err: any) {
      return {
        success: false,
        data: null,
        error: {
          code: 'GAS_REQUEST_FAILED',
          message: err.message || 'Koneksi ke Google Apps Script gagal'
        }
      };
    }
  }

  // --- Test Gas Connection ---
  public async testGasConnection(testUrl?: string): Promise<{ success: boolean; message: string; latencyMs?: number }> {
    const targetUrl = testUrl || this.gasUrl;
    if (!targetUrl) {
      return { success: false, message: 'URL Google Apps Script belum dimasukkan' };
    }

    const start = performance.now();
    try {
      const resp = await fetch(`${targetUrl}?action=ping`, { redirect: 'follow' });
      const latencyMs = Math.round(performance.now() - start);
      if (resp.ok) {
        const json = await resp.json();
        if (json.success) {
          return {
            success: true,
            message: `Koneksi Google Apps Script berhasil (${latencyMs}ms)`,
            latencyMs
          };
        }
      }
      return { success: false, message: `Respon status HTTP ${resp.status}` };
    } catch (err: any) {
      return { success: false, message: `Gagal terhubung: ${err.message}` };
    }
  }

  // --- Categories API ---
  public async getCategories(): Promise<ApiResponse<Category[]>> {
    if (this.isUsingLiveGas()) {
      return this.callGas<Category[]>('listCategories');
    }
    const cats: Category[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
    return {
      success: true,
      data: cats.sort((a, b) => a.display_order - b.display_order),
      meta: { backend_mode: 'local_fixture' }
    };
  }

  public async getSubcategories(categoryId?: string): Promise<ApiResponse<Subcategory[]>> {
    if (this.isUsingLiveGas()) {
      return this.callGas<Subcategory[]>('listSubcategories', 'GET', { categoryId });
    }
    const all: Subcategory[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBCATEGORIES) || '[]');
    const filtered = categoryId ? all.filter(s => s.category_id === categoryId) : all;
    return {
      success: true,
      data: filtered.sort((a, b) => a.display_order - b.display_order),
      meta: { backend_mode: 'local_fixture' }
    };
  }

  // --- Content API ---
  public async getContentList(options: {
    categoryId?: string;
    subcategoryId?: string;
    region?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<ContentItem[]>> {
    if (this.isUsingLiveGas()) {
      return this.callGas<ContentItem[]>('listContent', 'GET', options);
    }

    const all: ContentItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTENT) || '[]');
    const filtered = all.filter(item => {
      // If status filter provided, match it; default to 'published' for public catalog
      const targetStatus = options.status || 'published';
      if (targetStatus !== 'all' && item.publication_status !== targetStatus) return false;
      if (options.categoryId && item.category_id !== options.categoryId) return false;
      if (options.subcategoryId && item.subcategory_id !== options.subcategoryId) return false;
      if (options.region && options.region !== 'all' && item.origin_province.toLowerCase() !== options.region.toLowerCase()) return false;
      if (options.search) {
        const q = options.search.toLowerCase();
        const mTitle = item.title.toLowerCase().includes(q);
        const mDesc = item.description.toLowerCase().includes(q);
        const mReg = item.origin_province.toLowerCase().includes(q);
        if (!mTitle && !mDesc && !mReg) return false;
      }
      return true;
    });

    const page = options.page || 1;
    const limit = options.limit || 12;
    const startIndex = (page - 1) * limit;
    const paged = filtered.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: paged,
      meta: {
        total: filtered.length,
        page,
        limit,
        backend_mode: 'local_fixture'
      }
    };
  }

  public async getContentBySlug(slug: string): Promise<ApiResponse<ContentItem>> {
    if (this.isUsingLiveGas()) {
      return this.callGas<ContentItem>('getContentBySlug', 'GET', { slug });
    }

    const all: ContentItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTENT) || '[]');
    const found = all.find(item => item.slug === slug);

    if (found) {
      return { success: true, data: found, meta: { backend_mode: 'local_fixture' } };
    }
    return {
      success: false,
      data: null,
      error: { code: 'NOT_FOUND', message: 'Konten kebudayaan tidak ditemukan' }
    };
  }

  public async getFeaturedContent(): Promise<ApiResponse<ContentItem[]>> {
    if (this.isUsingLiveGas()) {
      return this.callGas<ContentItem[]>('listFeaturedContent');
    }
    const all: ContentItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTENT) || '[]');
    const featured = all.filter(c => c.publication_status === 'published' && c.is_featured);
    return { success: true, data: featured, meta: { backend_mode: 'local_fixture' } };
  }

  public async getRelatedContent(contentId: string, categoryId: string): Promise<ApiResponse<ContentItem[]>> {
    if (this.isUsingLiveGas()) {
      return this.callGas<ContentItem[]>('listRelatedContent', 'GET', { contentId, categoryId });
    }
    const all: ContentItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTENT) || '[]');
    const related = all.filter(c => c.content_id !== contentId && c.category_id === categoryId && c.publication_status === 'published').slice(0, 4);
    return { success: true, data: related, meta: { backend_mode: 'local_fixture' } };
  }

  // --- Pagelaran Events API ---
  public async getEvents(options: {
    category?: string;
    province?: string;
    status?: string;
    search?: string;
  } = {}): Promise<ApiResponse<CulturalEvent[]>> {
    if (this.isUsingLiveGas()) {
      return this.callGas<CulturalEvent[]>('listEvents', 'GET', options);
    }

    const all: CulturalEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]');
    const now = new Date();

    const filtered = all.filter(ev => {
      if (ev.publication_status !== 'published') return false;
      if (options.category && options.category !== 'all' && ev.category !== options.category) return false;
      if (options.province && options.province !== 'all' && ev.province.toLowerCase() !== options.province.toLowerCase()) return false;

      // Calculate runtime status
      const start = new Date(ev.start_datetime);
      const end = new Date(ev.end_datetime);
      let calculatedStatus = ev.event_status;
      if (ev.event_status !== 'canceled' && ev.event_status !== 'postponed') {
        if (now < start) calculatedStatus = 'upcoming';
        else if (now >= start && now <= end) calculatedStatus = 'ongoing';
        else calculatedStatus = 'completed';
      }

      if (options.status && options.status !== 'all' && calculatedStatus !== options.status) return false;

      if (options.search) {
        const q = options.search.toLowerCase();
        const mTitle = ev.title.toLowerCase().includes(q);
        const mVenue = ev.venue.toLowerCase().includes(q);
        const mCity = ev.city.toLowerCase().includes(q);
        if (!mTitle && !mVenue && !mCity) return false;
      }
      return true;
    });

    // Sort upcoming events chronologically
    filtered.sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime());

    return {
      success: true,
      data: filtered,
      meta: { total: filtered.length, backend_mode: 'local_fixture' }
    };
  }

  public async getEventBySlug(slug: string): Promise<ApiResponse<CulturalEvent>> {
    if (this.isUsingLiveGas()) {
      return this.callGas<CulturalEvent>('getEventBySlug', 'GET', { slug });
    }
    const all: CulturalEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]');
    const found = all.find(e => e.slug === slug);
    if (found) {
      return { success: true, data: found, meta: { backend_mode: 'local_fixture' } };
    }
    return { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Pagelaran budaya tidak ditemukan' } };
  }

  // --- Admin OTP Authentication ---
  public async requestAdminOtp(email: string): Promise<ApiResponse<{ sent: boolean; message: string; simulated_otp?: string }>> {
    if (!email || !email.includes('@')) {
      return { success: false, data: null, error: { code: 'INVALID_EMAIL', message: 'Format email tidak valid' } };
    }

    if (this.isUsingLiveGas()) {
      return this.callGas('requestAdminOtp', 'POST', { email });
    }

    // Local / Dev Mode interactive OTP logic
    const cleanEmail = email.trim().toLowerCase();
    const authorized = INITIAL_ADMINS.find(a => a.email.toLowerCase() === cleanEmail && a.account_status === 'active');

    if (!authorized) {
      return {
        success: false,
        data: null,
        error: {
          code: 'UNAUTHORIZED_EMAIL',
          message: 'Alamat surel tidak terdaftar dalam basis data administrator resmi ADARUPA.'
        }
      };
    }

    // Rate limiting cooldown (60 seconds)
    const lastSent = sessionStorage.getItem(`otp_cooldown_${cleanEmail}`);
    const now = Date.now();
    if (lastSent && now - parseInt(lastSent, 10) < 60000) {
      const waitSec = Math.ceil((60000 - (now - parseInt(lastSent, 10))) / 1000);
      return {
        success: false,
        data: null,
        error: { code: 'COOLDOWN', message: `Mohon tunggu ${waitSec} detik sebelum mengirim ulang OTP.` }
      };
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpPayload = {
      email: cleanEmail,
      otp,
      expiresAt: now + 10 * 60 * 1000,
      attempts: 0
    };

    sessionStorage.setItem(`otp_secret_${cleanEmail}`, JSON.stringify(otpPayload));
    sessionStorage.setItem(`otp_cooldown_${cleanEmail}`, now.toString());

    // Record into simulated mailbox
    const mailbox = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEST_MAILBOX) || '[]');
    mailbox.unshift({
      id: 'mail_' + Date.now(),
      to: cleanEmail,
      subject: '[ADARUPA] Kode OTP Masuk Administrator',
      otp,
      sent_at: new Date().toLocaleTimeString('id-ID'),
      expires_in: '10 menit'
    });
    localStorage.setItem(STORAGE_KEYS.TEST_MAILBOX, JSON.stringify(mailbox.slice(0, 5)));

    return {
      success: true,
      data: {
        sent: true,
        message: `Kode OTP 6-digit telah dikirimkan ke surel ${cleanEmail}.`,
        simulated_otp: otp
      }
    };
  }

  public async verifyAdminOtp(email: string, otp: string): Promise<ApiResponse<{ session: AdminSession }>> {
    if (!email || !otp) {
      return { success: false, data: null, error: { code: 'MISSING_FIELDS', message: 'Email dan OTP wajib diisi' } };
    }

    if (this.isUsingLiveGas()) {
      return this.callGas('verifyAdminOtp', 'POST', { email, otp });
    }

    const cleanEmail = email.trim().toLowerCase();
    const storedRaw = sessionStorage.getItem(`otp_secret_${cleanEmail}`);

    if (!storedRaw) {
      return {
        success: false,
        data: null,
        error: { code: 'OTP_EXPIRED', message: 'Kode OTP tidak ditemukan atau telah kedaluwarsa. Silakan minta kode baru.' }
      };
    }

    const otpData = JSON.parse(storedRaw);
    const now = Date.now();

    if (now > otpData.expiresAt) {
      sessionStorage.removeItem(`otp_secret_${cleanEmail}`);
      return { success: false, data: null, error: { code: 'OTP_EXPIRED', message: 'Kode OTP telah kedaluwarsa (lebih dari 10 menit).' } };
    }

    if (otpData.attempts >= 5) {
      sessionStorage.removeItem(`otp_secret_${cleanEmail}`);
      return { success: false, data: null, error: { code: 'MAX_ATTEMPTS', message: 'Batas 5 kali percobaan telah terlampaui.' } };
    }

    if (otpData.otp !== otp.trim()) {
      otpData.attempts += 1;
      sessionStorage.setItem(`otp_secret_${cleanEmail}`, JSON.stringify(otpData));
      return {
        success: false,
        data: null,
        error: { code: 'INVALID_OTP', message: `Kode OTP salah. Sisa percobaan: ${5 - otpData.attempts}` }
      };
    }

    // Success! Revoke OTP
    sessionStorage.removeItem(`otp_secret_${cleanEmail}`);

    const admin = INITIAL_ADMINS.find(a => a.email.toLowerCase() === cleanEmail) || {
      admin_id: 'adm_01',
      email: cleanEmail,
      display_name: 'Administrator Budaya',
      role: 'super_admin'
    };

    const session: AdminSession = {
      token: 'tok_' + Math.random().toString(36).substring(2, 15),
      admin_id: admin.admin_id,
      email: admin.email,
      display_name: admin.display_name,
      role: admin.role,
      expires_at: new Date(now + 8 * 60 * 60 * 1000).toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));

    this.recordAuditLog(admin.admin_id, admin.email, 'LOGIN_OTP', 'AUTH', admin.admin_id, 'success', 'Masuk melalui OTP aman');

    return {
      success: true,
      data: { session }
    };
  }

  public getActiveSession(): AdminSession | null {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    try {
      const session: AdminSession = JSON.parse(raw);
      if (new Date(session.expires_at).getTime() < Date.now()) {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  public logoutAdmin(): void {
    const session = this.getActiveSession();
    if (session) {
      this.recordAuditLog(session.admin_id, session.email, 'LOGOUT', 'AUTH', session.admin_id, 'success');
    }
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  // --- Admin Dashboard Metrics ---
  public async getAdminMetrics(): Promise<ApiResponse<{
    total_published: number;
    total_drafts: number;
    total_media: number;
    upcoming_events: number;
    recent_activity: AuditLogEntry[];
  }>> {
    if (this.isUsingLiveGas()) {
      return this.callGas('getAdminDashboardMetrics', 'POST', { token: this.getActiveSession()?.token });
    }

    const contents: ContentItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTENT) || '[]');
    const events: CulturalEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]');
    const media: MediaAsset[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEDIA) || '[]');
    const logs: AuditLogEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOG) || '[]');

    return {
      success: true,
      data: {
        total_published: contents.filter(c => c.publication_status === 'published').length,
        total_drafts: contents.filter(c => c.publication_status === 'draft').length,
        total_media: media.length,
        upcoming_events: events.filter(e => e.event_status === 'upcoming').length,
        recent_activity: logs.slice(-6).reverse()
      }
    };
  }

  // --- Admin Content Operations ---
  public async saveContent(item: Partial<ContentItem>): Promise<ApiResponse<ContentItem>> {
    const session = this.getActiveSession();
    if (!session) {
      return { success: false, data: null, error: { code: 'UNAUTHORIZED', message: 'Akses administrator diperlukan' } };
    }

    if (this.isUsingLiveGas()) {
      const action = item.content_id ? 'updateContent' : 'createContent';
      return this.callGas(action, 'POST', { token: session.token, contentId: item.content_id, content: item });
    }

    const all: ContentItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTENT) || '[]');
    const now = new Date().toISOString();

    if (item.content_id) {
      // Update
      const index = all.findIndex(c => c.content_id === item.content_id);
      if (index === -1) {
        return { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Konten tidak ditemukan' } };
      }
      const updated: ContentItem = {
        ...all[index],
        ...item,
        updated_at: now
      };
      all[index] = updated;
      localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(all));

      this.recordAuditLog(session.admin_id, session.email, 'UPDATE_CONTENT', 'CONTENT', updated.content_id, 'success', updated.title);
      return { success: true, data: updated };
    } else {
      // Create
      const newId = 'cnt_' + Date.now().toString(36);
      const slug = (item.title || 'konten-budaya')
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      const created: ContentItem = {
        content_id: newId,
        slug,
        title: item.title || 'Karya Budaya Baru',
        description: item.description || '',
        category_id: (item.category_id as any) || 'lalakon',
        subcategory_id: item.subcategory_id || 'sub_l1',
        subcategory_name: item.subcategory_name || 'Cerita Rakyat',
        content_type: item.content_type || 'video',
        origin_province: item.origin_province || 'Jawa Barat',
        origin_city: item.origin_city || '',
        duration_seconds: item.duration_seconds || 600,
        cover_url: item.cover_url || '',
        media_url: item.media_url || '',
        drive_file_id: item.drive_file_id || '',
        publication_status: item.publication_status || 'draft',
        is_featured: Boolean(item.is_featured),
        published_at: item.publication_status === 'published' ? now : '',
        created_at: now,
        updated_at: now,
        credits: item.credits,
        tutorial_data: item.tutorial_data
      };

      all.unshift(created);
      localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(all));

      this.recordAuditLog(session.admin_id, session.email, 'CREATE_CONTENT', 'CONTENT', created.content_id, 'success', created.title);
      return { success: true, data: created };
    }
  }

  public async deleteContentMetadata(contentId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const session = this.getActiveSession();
    if (!session) {
      return { success: false, data: null, error: { code: 'UNAUTHORIZED', message: 'Akses administrator diperlukan' } };
    }

    if (this.isUsingLiveGas()) {
      return this.callGas('deleteContentMetadata', 'POST', { token: session.token, contentId });
    }

    let all: ContentItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTENT) || '[]');
    all = all.filter(c => c.content_id !== contentId);
    localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(all));

    this.recordAuditLog(session.admin_id, session.email, 'DELETE_METADATA', 'CONTENT', contentId, 'success', 'Penghapusan metadata konten');
    return { success: true, data: { deleted: true } };
  }

  // --- Admin Events Operations ---
  public async saveEvent(event: Partial<CulturalEvent>): Promise<ApiResponse<CulturalEvent>> {
    const session = this.getActiveSession();
    if (!session) {
      return { success: false, data: null, error: { code: 'UNAUTHORIZED', message: 'Akses administrator diperlukan' } };
    }

    if (this.isUsingLiveGas()) {
      const action = event.event_id ? 'updateEvent' : 'createEvent';
      return this.callGas(action, 'POST', { token: session.token, eventId: event.event_id, event });
    }

    const all: CulturalEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]');
    const now = new Date().toISOString();

    if (event.event_id) {
      const index = all.findIndex(e => e.event_id === event.event_id);
      if (index === -1) {
        return { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Pagelaran tidak ditemukan' } };
      }
      const updated: CulturalEvent = { ...all[index], ...event, updated_at: now };
      all[index] = updated;
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(all));

      this.recordAuditLog(session.admin_id, session.email, 'UPDATE_EVENT', 'EVENT', updated.event_id, 'success', updated.title);
      return { success: true, data: updated };
    } else {
      const newId = 'ev_' + Date.now().toString(36);
      const slug = (event.title || 'pagelaran-budaya')
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      const created: CulturalEvent = {
        event_id: newId,
        slug,
        title: event.title || 'Agenda Budaya Baru',
        description: event.description || '',
        category: event.category || 'Festival Budaya',
        province: event.province || 'Jawa Tengah',
        city: event.city || 'Surakarta',
        venue: event.venue || '',
        address: event.address || '',
        start_datetime: event.start_datetime || now,
        end_datetime: event.end_datetime || now,
        organizer: event.organizer || 'Komunitas Budaya',
        poster_url: event.poster_url || '',
        official_source_url: event.official_source_url || '',
        registration_url: event.registration_url || '',
        verification_status: event.verification_status || 'verified',
        publication_status: event.publication_status || 'published',
        event_status: event.event_status || 'upcoming',
        created_at: now,
        updated_at: now
      };

      all.unshift(created);
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(all));

      this.recordAuditLog(session.admin_id, session.email, 'CREATE_EVENT', 'EVENT', created.event_id, 'success', created.title);
      return { success: true, data: created };
    }
  }

  // --- Admin Media Library ---
  public async getMediaAssets(): Promise<ApiResponse<MediaAsset[]>> {
    if (this.isUsingLiveGas()) {
      return this.callGas('listMediaAssets', 'POST', { token: this.getActiveSession()?.token });
    }
    const assets: MediaAsset[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEDIA) || '[]');
    return { success: true, data: assets };
  }

  public async associateMediaAsset(asset: Partial<MediaAsset>): Promise<ApiResponse<MediaAsset>> {
    const session = this.getActiveSession();
    if (!session) {
      return { success: false, data: null, error: { code: 'UNAUTHORIZED', message: 'Akses administrator diperlukan' } };
    }

    if (this.isUsingLiveGas()) {
      return this.callGas('associateDriveAsset', 'POST', { token: session.token, asset });
    }

    const assets: MediaAsset[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEDIA) || '[]');
    const now = new Date().toISOString();
    const newAsset: MediaAsset = {
      media_asset_id: 'med_' + Date.now().toString(36),
      content_id: asset.content_id || '',
      drive_file_id: asset.drive_file_id || '',
      file_name: asset.file_name || 'berkas_budaya.mp4',
      mime_type: asset.mime_type || 'video/mp4',
      file_size: asset.file_size || '120 MB',
      asset_role: asset.asset_role || 'primary_media',
      access_classification: asset.access_classification || 'public',
      availability_status: 'available',
      created_at: now,
      updated_at: now
    };

    assets.unshift(newAsset);
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(assets));

    this.recordAuditLog(session.admin_id, session.email, 'ASSOCIATE_DRIVE_ASSET', 'MEDIA', newAsset.media_asset_id, 'success', newAsset.file_name);
    return { success: true, data: newAsset };
  }

  // --- Settings ---
  public getSettings(): AppSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : DEFAULT_APP_SETTINGS;
  }

  public saveSettings(settings: Partial<AppSettings>): void {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    if (settings.gas_endpoint_url !== undefined) {
      this.setGasUrl(settings.gas_endpoint_url);
    }
  }

  public getTestMailbox(): any[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TEST_MAILBOX) || '[]');
  }

  // --- Zero-Hardcoded Site Configuration & Branding CMS API ---
  public async getPublicSiteConfig(): Promise<ApiResponse<SiteConfig>> {
    if (this.isUsingLiveGas()) {
      return this.callGas<SiteConfig>('getPublicSiteConfig');
    }
    const raw = localStorage.getItem(STORAGE_KEYS.PUBLISHED_SITE_CONFIG);
    const config: SiteConfig = raw ? JSON.parse(raw) : DEFAULT_SITE_CONFIG;
    return {
      success: true,
      data: config,
      meta: { backend_mode: 'local_fixture' }
    };
  }

  public async getDraftSiteConfig(): Promise<ApiResponse<SiteConfig>> {
    const session = this.getActiveSession();
    if (!session) {
      return { success: false, data: null, error: { code: 'UNAUTHORIZED', message: 'Akses administrator diperlukan' } };
    }

    if (this.isUsingLiveGas()) {
      return this.callGas<SiteConfig>('getDraftSiteConfig', 'POST', { token: session.token });
    }

    const raw = localStorage.getItem(STORAGE_KEYS.DRAFT_SITE_CONFIG) || localStorage.getItem(STORAGE_KEYS.PUBLISHED_SITE_CONFIG);
    const config: SiteConfig = raw ? JSON.parse(raw) : DEFAULT_SITE_CONFIG;
    return {
      success: true,
      data: config,
      meta: { backend_mode: 'local_fixture' }
    };
  }

  public async saveDraftSiteConfig(config: SiteConfig): Promise<ApiResponse<SiteConfig>> {
    const session = this.getActiveSession();
    if (!session) {
      return { success: false, data: null, error: { code: 'UNAUTHORIZED', message: 'Akses administrator diperlukan' } };
    }

    if (this.isUsingLiveGas()) {
      return this.callGas<SiteConfig>('saveDraftSiteConfig', 'POST', { token: session.token, config });
    }

    config.updatedAt = new Date().toISOString();
    config.updatedBy = session.email;
    localStorage.setItem(STORAGE_KEYS.DRAFT_SITE_CONFIG, JSON.stringify(config));

    this.recordAuditLog(session.admin_id, session.email, 'SAVE_DRAFT_CONFIG', 'SITE_CONFIG', 'draft', 'success', 'Simpan draf konfigurasi situs');
    return { success: true, data: config };
  }

  public async publishSiteConfig(config: SiteConfig, summary?: string): Promise<ApiResponse<{ publishedConfig: SiteConfig; historyId: string; version: number }>> {
    const session = this.getActiveSession();
    if (!session) {
      return { success: false, data: null, error: { code: 'UNAUTHORIZED', message: 'Akses administrator diperlukan' } };
    }

    if (this.isUsingLiveGas()) {
      return this.callGas('publishSiteConfig', 'POST', { token: session.token, config, summary });
    }

    const nextVersion = (config.version || 1) + 1;
    const now = new Date().toISOString();
    const updatedConfig: SiteConfig = {
      ...config,
      version: nextVersion,
      updatedAt: now,
      updatedBy: session.email
    };

    localStorage.setItem(STORAGE_KEYS.PUBLISHED_SITE_CONFIG, JSON.stringify(updatedConfig));
    localStorage.setItem(STORAGE_KEYS.DRAFT_SITE_CONFIG, JSON.stringify(updatedConfig));

    // Save history snapshot
    const historyId = 'hist_v' + nextVersion + '_' + Date.now().toString(36);
    const history: ConfigHistorySnapshot[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG_HISTORY) || '[]');
    history.unshift({
      historyId,
      version: nextVersion,
      publishedAt: now,
      publishedBy: session.email,
      summary: summary || 'Publikasi pembaruan konfigurasi dan konten website',
      configSnapshot: updatedConfig
    });
    localStorage.setItem(STORAGE_KEYS.CONFIG_HISTORY, JSON.stringify(history.slice(0, 30)));

    this.recordAuditLog(session.admin_id, session.email, 'PUBLISH_SITE_CONFIG', 'SITE_CONFIG', 'v' + nextVersion, 'success', summary || 'Publikasi konfigurasi situs');

    return {
      success: true,
      data: {
        publishedConfig: updatedConfig,
        historyId,
        version: nextVersion
      }
    };
  }

  public async rollbackSiteConfig(historyId: string): Promise<ApiResponse<{ publishedConfig: SiteConfig; version: number }>> {
    const session = this.getActiveSession();
    if (!session) {
      return { success: false, data: null, error: { code: 'UNAUTHORIZED', message: 'Akses administrator diperlukan' } };
    }

    if (this.isUsingLiveGas()) {
      return this.callGas('rollbackSiteConfig', 'POST', { token: session.token, historyId });
    }

    const history: ConfigHistorySnapshot[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG_HISTORY) || '[]');
    const targetSnapshot = history.find(h => h.historyId === historyId);

    if (!targetSnapshot) {
      return { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Versi snapshot riwayat tidak ditemukan' } };
    }

    const res = await this.publishSiteConfig(
      targetSnapshot.configSnapshot,
      `Rollback pemulihan ke versi ${targetSnapshot.version} (${targetSnapshot.historyId})`
    );

    if (res.success && res.data) {
      return {
        success: true,
        data: {
          publishedConfig: res.data.publishedConfig,
          version: res.data.version
        }
      };
    }

    return { success: false, data: null, error: { code: 'ROLLBACK_FAILED', message: 'Gagal melakukan pemulihan konfigurasi' } };
  }

  public async getSiteConfigHistory(): Promise<ApiResponse<ConfigHistorySnapshot[]>> {
    const session = this.getActiveSession();
    if (!session) {
      return { success: false, data: null, error: { code: 'UNAUTHORIZED', message: 'Akses administrator diperlukan' } };
    }

    if (this.isUsingLiveGas()) {
      return this.callGas<ConfigHistorySnapshot[]>('getSiteConfigHistory', 'POST', { token: session.token });
    }

    const history: ConfigHistorySnapshot[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG_HISTORY) || '[]');
    return {
      success: true,
      data: history
    };
  }

  private recordAuditLog(adminId: string, email: string, action: string, resType: string, resId: string, result: 'success' | 'failure', details?: string) {
    const logs: AuditLogEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOG) || '[]');
    logs.push({
      log_id: 'log_' + Date.now().toString(36),
      admin_id: adminId,
      admin_email: email,
      action,
      resource_type: resType,
      resource_id: resId,
      timestamp: new Date().toISOString(),
      result,
      details
    });
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(logs.slice(-50)));
  }
}

export const api = new ApiClient();