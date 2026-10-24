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

