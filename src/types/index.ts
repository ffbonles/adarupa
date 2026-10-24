export type MainCategorySlug = 'lalakon' | 'gema-swara' | 'gelanggang' | 'pagelaran';

export interface Category {
  category_id: string;
  slug: MainCategorySlug;
  name: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

export interface Subcategory {
  subcategory_id: string;
  category_id: string;
  slug: string;
  name: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

export type PublicationStatus = 'published' | 'draft' | 'archived';

export interface TutorialData {
  equipment: string[];
  players_count: string;
  rules: string[];
  instructions: string[];
  safety_notes?: string;
  related_games?: string[];
}

export interface ContentItem {
  content_id: string;
  slug: string;
  title: string;
  description: string;
  category_id: MainCategorySlug;
  subcategory_id: string;
  subcategory_name?: string;
  content_type: 'video' | 'audio' | 'interactive';
  origin_province: string;
  origin_city?: string;
  duration_seconds: number;
  cover_url: string;
  cover_file_id?: string;
  primary_media_asset_id?: string;
  media_url?: string;
  drive_file_id?: string;
  series_id?: string;
  series_title?: string;
  episode_number?: number;
  publication_status: PublicationStatus;
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  credits?: {
    director_or_teller?: string;
    production_or_source?: string;
    cultural_consultant?: string;
    license?: string;
  };
  tutorial_data?: TutorialData;
  audio_transcript?: string;
}

export interface MediaAsset {
  media_asset_id: string;
  content_id: string;
  drive_file_id: string;
  file_name: string;
  mime_type: string;
  file_size?: string;
  asset_role: 'primary_media' | 'cover' | 'poster' | 'subtitle' | 'attachment';
  access_classification: 'public' | 'restricted';
  availability_status: 'available' | 'verifying' | 'missing' | 'inaccessible';
  created_at: string;
  updated_at: string;
}

export interface Series {
  series_id: string;
  title: string;
  slug: string;
  description: string;
  category_id: MainCategorySlug;
  cover_url: string;
  cover_file_id?: string;
  publication_status: PublicationStatus;
  total_episodes?: number;
}

export interface Episode {
  episode_id: string;
  series_id: string;
  content_id: string;
  episode_number: number;
  title: string;
  display_order: number;
  duration_seconds: number;
  media_url?: string;
}

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'postponed' | 'canceled';
export type VerificationStatus = 'verified' | 'unverified';

export interface CulturalEvent {
  event_id: string;
  slug: string;
  title: string;
  description: string;
  category: 'Festival Budaya' | 'Pertunjukan Seni' | 'Pameran Budaya' | 'Upacara Adat' | 'Lokakarya dan Edukasi';
  province: string;
  city: string;
  venue: string;
  address: string;
  start_datetime: string; // ISO 8601
  end_datetime: string;   // ISO 8601
  organizer: string;
  poster_url: string;
  poster_file_id?: string;
  official_source_url?: string;
  registration_url?: string;
  verification_status: VerificationStatus;
  publication_status: 'published' | 'draft';
  event_status: EventStatus;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  admin_id: string;
  email: string;
  display_name: string;
  role: 'super_admin' | 'editor';
  account_status: 'active' | 'suspended';
}

export interface AdminSession {
  token: string;
  admin_id: string;
  email: string;
  display_name: string;
  role: string;
  expires_at: string;
}

export interface AuditLogEntry {
  log_id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  timestamp: string;
  result: 'success' | 'failure';
  details?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
  } | null;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    timestamp?: string;
    backend_mode?: 'google_apps_script' | 'local_fixture';
  };
}

export interface AppSettings {
  app_name: string;
  tagline: string;
  descriptor: string;
  gas_endpoint_url: string;
  google_sheets_id: string;
  google_drive_folder_id: string;
  contact_email: string;
  allow_event_submissions: boolean;
}

// ============================================================================
// ZERO-HARDCODED BRANDING & EDITABLE SITE CONFIGURATION SCHEMA
// ============================================================================

export interface BrandIdentity {
  appName: string;
  descriptor: string;
  tagline: string;
  brandDescription: string;
  logoMode: 'symbol' | 'image';
  logoImageUrl: string;
  logoDriveFileId?: string;
  alternateLogoUrl: string;
  faviconUrl: string;
  contactEmail: string;
  editorialCurator: string;
}

export interface ThemeColors {
  primaryMaroon: string;
  deepMaroon: string;
  forestGreen: string;
  warmGold: string;
  ivoryBackground: string;
  terracottaAccent: string;
  primaryText: string;
  secondaryText: string;
  borderColor: string;
  fontHeading: 'Playfair Display' | 'Cinzel' | 'Plus Jakarta Sans';
  fontBody: 'Plus Jakarta Sans' | 'DM Sans';
  enableBatikPatterns: boolean;
}

export interface HeroConfig {
  kickerBadge: string;
  mainHeadline: string;
  supportingDescription: string;
  primaryCtaLabel: string;
  primaryCtaLink: string;
  secondaryCtaLabel: string;
  secondaryCtaLink: string;
  bannerImageUrl: string;
  bannerDriveFileId?: string;
  featuredCardLabel: string;
}

export interface SectionHeadings {
  fourDomainsTitle: string;
  fourDomainsSubtitle: string;
  lalakonSectionKicker: string;
  lalakonSectionTitle: string;
  lalakonViewAllLabel: string;
  gemaSwaraSectionKicker: string;
  gemaSwaraSectionTitle: string;
  gemaSwaraSectionSubtitle: string;
  gemaSwaraViewAllLabel: string;
  gelanggangSectionKicker: string;
  gelanggangSectionTitle: string;
  gelanggangViewAllLabel: string;
  pagelaranSectionKicker: string;
  pagelaranSectionTitle: string;
  pagelaranViewAllLabel: string;
}

export interface NavLinkItem {
  id: string;
  label: string;
  path: string;
  isVisible: boolean;
  order: number;
}

export interface CategoryDisplayConfig {
  slug: MainCategorySlug;
  displayName: string;
  description: string;
  subtext: string;
  customIcon?: string;
  coverImageUrl?: string;
  displayOrder: number;
  badgeLabel: string;
}

export interface StaticPageContent {
  aboutTitle: string;
  aboutSubtitle: string;
  aboutBody: string;
  guidelinesTitle: string;
  guidelinesBody: string;
  privacyPolicyTitle: string;
  privacyPolicyBody: string;
  termsOfUseTitle: string;
  termsOfUseBody: string;
}

export interface UiStrings {
  searchPlaceholder: string;
  searchButtonLabel: string;
  searchModalKicker: string;
  noResultsFoundTitle: string;
  noResultsFoundDescription: string;
  resetFilterLabel: string;
  loadingMessage: string;
  emptyCategoryMessage: string;
  shareSuccessMessage: string;
  shareActionLabel: string;
  backToCatalogLabel: string;
  playVideoLabel: string;
  playAudioLabel: string;
  viewDetailsLabel: string;
}

export interface FooterConfig {
  brandMissionText: string;
  taglineQuote: string;
  culturalCategoriesHeading: string;
  governanceHeading: string;
  contactHeading: string;
  contactInvitationText: string;
  copyrightText: string;
  accessibilityNotice: string;
  privacyLinkText: string;
  guidelinesLinkText: string;
  termsLinkText: string;
}

export interface SeoConfig {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
}

export interface SiteConfig {
  version: number;
  updatedAt: string;
  updatedBy: string;
  brand: BrandIdentity;
  theme: ThemeColors;
  hero: HeroConfig;
  sections: SectionHeadings;
  navigation: NavLinkItem[];
  categories: CategoryDisplayConfig[];
  staticPages: StaticPageContent;
  uiStrings: UiStrings;
  footer: FooterConfig;
  seo: SeoConfig;
}

export interface ConfigHistorySnapshot {
  historyId: string;
  version: number;
  publishedAt: string;
  publishedBy: string;
  summary: string;
  configSnapshot: SiteConfig;
}
