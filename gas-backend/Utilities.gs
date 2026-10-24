/**
 * ADARUPA — Utilities.gs
 * Google Sheets spreadsheet access, automatic schema initialization,
 * and data mapping helper functions.
 */

var Utilities_gs = {
  getSpreadsheet: function() {
    var scriptProperties = PropertiesService.getScriptProperties();
    var sheetId = scriptProperties.getProperty('SPREADSHEET_ID');
    if (sheetId) {
      return SpreadsheetApp.openById(sheetId);
    }
    // Fallback to active spreadsheet if bound to a container
    try {
      return SpreadsheetApp.getActiveSpreadsheet();
    } catch (e) {
      throw new Error('SPREADSHEET_ID belum dikonfigurasi di Script Properties.');
    }
  },

  /**
   * One-click initialization function for administrators.
   * Run this function once from the Apps Script editor to create
   * all 9 required sheets with proper headers and initial seed data.
   */
  setupAdarupaSheets: function() {
    var ss = this.getSpreadsheet();

    var sheetsConfig = {
      'SETTINGS': ['setting_key', 'setting_value', 'updated_at'],
      'CATEGORIES': ['category_id', 'slug', 'name', 'description', 'icon', 'display_order', 'is_active'],
      'SUBCATEGORIES': ['subcategory_id', 'category_id', 'slug', 'name', 'description', 'display_order', 'is_active'],
      'CONTENT': ['content_id', 'slug', 'title', 'description', 'category_id', 'subcategory_id', 'content_type', 'origin_province', 'origin_city', 'duration_seconds', 'cover_file_id', 'primary_media_asset_id', 'series_id', 'publication_status', 'is_featured', 'published_at', 'created_at', 'updated_at', 'credits_json', 'tutorial_json'],
      'MEDIA_ASSETS': ['media_asset_id', 'content_id', 'drive_file_id', 'file_name', 'mime_type', 'file_size', 'asset_role', 'access_classification', 'availability_status', 'created_at', 'updated_at'],
      'SERIES': ['series_id', 'title', 'slug', 'description', 'category_id', 'cover_file_id', 'publication_status'],
      'EPISODES': ['episode_id', 'series_id', 'content_id', 'episode_number', 'title', 'display_order'],
      'EVENTS': ['event_id', 'slug', 'title', 'description', 'category', 'province', 'city', 'venue', 'address', 'start_datetime', 'end_datetime', 'organizer', 'poster_file_id', 'official_source_url', 'registration_url', 'verification_status', 'publication_status', 'event_status', 'created_at', 'updated_at'],
      'ADMINS': ['admin_id', 'email', 'display_name', 'role', 'account_status', 'created_at', 'updated_at'],
      'AUDIT_LOG': ['log_id', 'admin_id', 'action', 'resource_type', 'resource_id', 'timestamp', 'result', 'details'],
      'SITE_CONTENT': ['content_key', 'category_group', 'content_value', 'status', 'version', 'updated_at', 'updated_by'],
      'CONFIG_HISTORY': ['history_id', 'version_number', 'snapshot_json', 'published_by', 'published_at', 'summary']
    };

    for (var name in sheetsConfig) {
      var sheet = ss.getSheetByName(name);
      if (!sheet) {
        sheet = ss.insertSheet(name);
      }
      var headers = sheetsConfig[name];
      var currentValues = sheet.getDataRange().getValues();
      if (currentValues.length === 0 || (currentValues.length === 1 && currentValues[0][0] === '')) {
        sheet.appendRow(headers);
        sheet.setFrozenRows(1);
      }
    }

    // Seed default Categories
    var catSheet = ss.getSheetByName('CATEGORIES');
    if (catSheet.getLastRow() <= 1) {
      catSheet.appendRow(['cat_lalakon', 'lalakon', 'Lalakon', 'Film dan kisah visual bertutur budaya nusantara', 'Film', 1, true]);
      catSheet.appendRow(['cat_gema_swara', 'gema-swara', 'Gema Swara', 'Dongeng audio, sandiwara radio, podcast, dan kidung tradisi', 'Headphones', 2, true]);
      catSheet.appendRow(['cat_gelanggang', 'gelanggang', 'Gelanggang', 'Tutorial dan ensiklopedia permainan tradisional daerah', 'Gamepad2', 3, true]);
      catSheet.appendRow(['cat_pagelaran', 'pagelaran', 'Pagelaran', 'Agenda festival, pameran seni, dan perhelatan adat nusantara', 'Calendar', 4, true]);
    }

    // Seed default Subcategories
    var subSheet = ss.getSheetByName('SUBCATEGORIES');
    if (subSheet.getLastRow() <= 1) {
      // Lalakon
      subSheet.appendRow(['sub_l1', 'lalakon', 'cerita-rakyat', 'Cerita Rakyat', 'Kisah tutur kearifan lokal daerah', 1, true]);
      subSheet.appendRow(['sub_l2', 'lalakon', 'legenda-nusantara', 'Legenda Nusantara', 'Asal usul tempat dan mitologi kepulauan', 2, true]);
      subSheet.appendRow(['sub_l3', 'lalakon', 'animasi-nusantara', 'Animasi Nusantara', 'Animasi visual untuk anak dan keluarga', 3, true]);
      subSheet.appendRow(['sub_l4', 'lalakon', 'film-pendek', 'Film Pendek', 'Karya sinematik kreator budaya lokal', 4, true]);
      subSheet.appendRow(['sub_l5', 'lalakon', 'dokumenter-budaya', 'Dokumenter Budaya', 'Eksplorasi mendalam tradisi yang bertahan', 5, true]);
      subSheet.appendRow(['sub_l6', 'lalakon', 'seni-pertunjukan', 'Seni Pertunjukan', 'Rekaman panggung tari, teater dan wayang', 6, true]);

      // Gema Swara
      subSheet.appendRow(['sub_g1', 'gema-swara', 'dongeng-audio', 'Dongeng Audio', 'Kisah pengantar tidur dan fabel nusantara', 1, true]);
      subSheet.appendRow(['sub_g2', 'gema-swara', 'sandiwara-radio', 'Sandiwara Radio', 'Drama audio berlatar kerajaan nusantara', 2, true]);
      subSheet.appendRow(['sub_g3', 'gema-swara', 'podcast-nusantara', 'Podcast Nusantara', 'Bincang mendalam dengan budayawan dan maestro', 3, true]);
      subSheet.appendRow(['sub_g4', 'gema-swara', 'kisah-sejarah', 'Kisah Sejarah', 'Naratif jejak peradaban kepulauan', 4, true]);
      subSheet.appendRow(['sub_g5', 'gema-swara', 'musik-tradisi', 'Musik dan Suara Tradisi', 'Gamelan, sasando, seruling, dan lanskap suara alam', 5, true]);

      // Gelanggang
      subSheet.appendRow(['sub_gl1', 'gelanggang', 'permainan-papan', 'Permainan Papan', 'Permainan strategi di atas papan kayu', 1, true]);
      subSheet.appendRow(['sub_gl2', 'gelanggang', 'permainan-kelompok', 'Permainan Kelompok', 'Permainan lapangan dan kebersamaan tim', 2, true]);
      subSheet.appendRow(['sub_gl3', 'gelanggang', 'permainan-ketangkasan', 'Permainan Ketangkasan', 'Uji keseimbangan dan ketangkasan fisik', 3, true]);
      subSheet.appendRow(['sub_gl4', 'gelanggang', 'permainan-strategi', 'Permainan Strategi', 'Asah taktik dan perhitungan langkah', 4, true]);
      subSheet.appendRow(['sub_gl5', 'gelanggang', 'permainan-daerah', 'Permainan Daerah', 'Warisan khas suku tertentu', 5, true]);

      // Pagelaran
      subSheet.appendRow(['sub_p1', 'pagelaran', 'festival-budaya', 'Festival Budaya', 'Pesta rakyat dan karnaval budaya', 1, true]);
      subSheet.appendRow(['sub_p2', 'pagelaran', 'pertunjukan-seni', 'Pertunjukan Seni', 'Pentas tari, musik tradisi, dan teater', 2, true]);
      subSheet.appendRow(['sub_p3', 'pagelaran', 'pameran-budaya', 'Pameran Budaya', 'Eksibisi artefak, batik, keris, dan seni kriya', 3, true]);
      subSheet.appendRow(['sub_p4', 'pagelaran', 'upacara-adat', 'Upacara Adat', 'Ritual tahunan dan perayaan syukuran daerah', 4, true]);
      subSheet.appendRow(['sub_p5', 'pagelaran', 'lokakarya-edukasi', 'Lokakarya dan Edukasi', 'Kelas membuat batik, menari, dan membatik', 5, true]);
    }

    return {
      success: true,
      message: 'Seluruh sheet ADARUPA berhasil diinisialisasi beserta data kategori default.'
    };
  },

  sheetRowsToObjects: function(sheet) {
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];

    var headers = data[0];
    var results = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var obj = {};
      for (var h = 0; h < headers.length; h++) {
        obj[headers[h]] = row[h];
      }
      results.push(obj);
    }
    return results;
  }
};
