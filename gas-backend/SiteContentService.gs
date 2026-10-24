/**
 * ADARUPA — SiteContentService.gs
 * Manages zero-hardcoded branding, editable website content, themes,
 * preview/draft mode, publication workflow, and version rollback.
 */

var SiteContentService = {
  getPublicSiteConfig: function() {
    var ss = Utilities_gs.getSpreadsheet();
    var sheet = ss.getSheetByName('SITE_CONTENT');
    if (!sheet) {
      return { success: true, data: this.getDefaultConfig() };
    }

    var rows = sheet.getDataRange().getValues();
    if (rows.length < 2) {
      return { success: true, data: this.getDefaultConfig() };
    }

    var headers = rows[0];
    var keyIdx = headers.indexOf('content_key');
    var valIdx = headers.indexOf('content_value');
    var statusIdx = headers.indexOf('status');

    var publishedMap = {};
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      if (row[statusIdx] === 'published') {
        try {
          publishedMap[row[keyIdx]] = JSON.parse(row[valIdx]);
        } catch (e) {
          publishedMap[row[keyIdx]] = row[valIdx];
        }
      }
    }

    if (publishedMap['full_site_config']) {
      return { success: true, data: publishedMap['full_site_config'] };
    }

    return { success: true, data: this.getDefaultConfig() };
  },

  getDraftSiteConfig: function(admin) {
    var ss = Utilities_gs.getSpreadsheet();
    var sheet = ss.getSheetByName('SITE_CONTENT');
    if (!sheet) {
      return { success: true, data: this.getDefaultConfig() };
    }

    var rows = sheet.getDataRange().getValues();
    var headers = rows[0];
    var keyIdx = headers.indexOf('content_key');
    var valIdx = headers.indexOf('content_value');
    var statusIdx = headers.indexOf('status');

    var draftConfig = null;
    var publishedConfig = null;

    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      if (row[keyIdx] === 'full_site_config') {
        if (row[statusIdx] === 'draft') {
          try { draftConfig = JSON.parse(row[valIdx]); } catch (e) {}
        } else if (row[statusIdx] === 'published') {
          try { publishedConfig = JSON.parse(row[valIdx]); } catch (e) {}
        }
      }
    }

    var result = draftConfig || publishedConfig || this.getDefaultConfig();
    return { success: true, data: result };
  },

  saveDraftSiteConfig: function(draftConfig, admin) {
    if (!draftConfig || typeof draftConfig !== 'object') {
      return { success: false, data: null, error: { code: 'INVALID_CONFIG', message: 'Data konfigurasi tidak valid' } };
    }

    var ss = Utilities_gs.getSpreadsheet();
    var sheet = ss.getSheetByName('SITE_CONTENT');
    if (!sheet) {
      sheet = ss.insertSheet('SITE_CONTENT');
      sheet.appendRow(['content_key', 'category_group', 'content_value', 'status', 'version', 'updated_at', 'updated_by']);
    }

    draftConfig.updatedAt = new Date().toISOString();
    draftConfig.updatedBy = admin.email;

    var rows = sheet.getDataRange().getValues();
    var headers = rows[0];
    var keyIdx = headers.indexOf('content_key');
    var statusIdx = headers.indexOf('status');
    var valIdx = headers.indexOf('content_value');
    var timeIdx = headers.indexOf('updated_at');
    var byIdx = headers.indexOf('updated_by');

    var foundRow = -1;
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][keyIdx] === 'full_site_config' && rows[i][statusIdx] === 'draft') {
        foundRow = i + 1;
        break;
      }
    }

    var jsonStr = JSON.stringify(draftConfig);
    var now = new Date().toISOString();

    if (foundRow !== -1) {
      sheet.getRange(foundRow, valIdx + 1).setValue(jsonStr);
      sheet.getRange(foundRow, timeIdx + 1).setValue(now);
      sheet.getRange(foundRow, byIdx + 1).setValue(admin.email);
    } else {
      sheet.appendRow(['full_site_config', 'site_bundle', jsonStr, 'draft', draftConfig.version || 1, now, admin.email]);
    }

    AuthService.logAction(admin.adminId, admin.email, 'SAVE_DRAFT_CONFIG', 'SITE_CONFIG', 'draft', 'success', 'Simpan draf konfigurasi situs');

    return { success: true, data: draftConfig };
  },

  publishSiteConfig: function(configToPublish, summary, admin) {
    if (!configToPublish || typeof configToPublish !== 'object') {
      return { success: false, data: null, error: { code: 'INVALID_CONFIG', message: 'Data konfigurasi tidak valid' } };
    }

    var ss = Utilities_gs.getSpreadsheet();
    var sheet = ss.getSheetByName('SITE_CONTENT');
    var historySheet = ss.getSheetByName('CONFIG_HISTORY');

    if (!sheet) {
      sheet = ss.insertSheet('SITE_CONTENT');
      sheet.appendRow(['content_key', 'category_group', 'content_value', 'status', 'version', 'updated_at', 'updated_by']);
    }
    if (!historySheet) {
      historySheet = ss.insertSheet('CONFIG_HISTORY');
      historySheet.appendRow(['history_id', 'version_number', 'snapshot_json', 'published_by', 'published_at', 'summary']);
    }

    var nextVersion = (configToPublish.version || 1) + 1;
    var now = new Date().toISOString();

    configToPublish.version = nextVersion;
    configToPublish.updatedAt = now;
    configToPublish.updatedBy = admin.email;

    var jsonStr = JSON.stringify(configToPublish);

    // Save as published
    var rows = sheet.getDataRange().getValues();
    var headers = rows[0];
    var keyIdx = headers.indexOf('content_key');
    var statusIdx = headers.indexOf('status');
    var valIdx = headers.indexOf('content_value');
    var verIdx = headers.indexOf('version');
    var timeIdx = headers.indexOf('updated_at');
    var byIdx = headers.indexOf('updated_by');

    var publishedRow = -1;
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][keyIdx] === 'full_site_config' && rows[i][statusIdx] === 'published') {
        publishedRow = i + 1;
        break;
      }
    }

    if (publishedRow !== -1) {
      sheet.getRange(publishedRow, valIdx + 1).setValue(jsonStr);
      sheet.getRange(publishedRow, verIdx + 1).setValue(nextVersion);
      sheet.getRange(publishedRow, timeIdx + 1).setValue(now);
      sheet.getRange(publishedRow, byIdx + 1).setValue(admin.email);
    } else {
      sheet.appendRow(['full_site_config', 'site_bundle', jsonStr, 'published', nextVersion, now, admin.email]);
    }

    // Also sync the draft record to match published
    this.saveDraftSiteConfig(configToPublish, admin);

    // Record snapshot into CONFIG_HISTORY
    var historyId = 'hist_' + Utilities.getUuid().substring(0, 8);
    historySheet.appendRow([
      historyId,
      nextVersion,
      jsonStr,
      admin.email,
      now,
      summary || 'Publikasi pembaruan konfigurasi situs'
    ]);

    AuthService.logAction(admin.adminId, admin.email, 'PUBLISH_SITE_CONFIG', 'SITE_CONFIG', 'v' + nextVersion, 'success', summary || 'Publikasi konfigurasi');

    return {
      success: true,
      data: {
        publishedConfig: configToPublish,
        historyId: historyId,
        version: nextVersion
      }
    };
  },

  rollbackSiteConfig: function(historyId, admin) {
    if (!historyId) {
      return { success: false, data: null, error: { code: 'MISSING_HISTORY_ID', message: 'ID Riwayat diperlukan' } };
    }

    var ss = Utilities_gs.getSpreadsheet();
    var historySheet = ss.getSheetByName('CONFIG_HISTORY');
    if (!historySheet) {
      return { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Riwayat tidak ditemukan' } };
    }

    var rows = historySheet.getDataRange().getValues();
    var headers = rows[0];
    var idIdx = headers.indexOf('history_id');
    var snapIdx = headers.indexOf('snapshot_json');

    var targetConfig = null;
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][idIdx] === historyId) {
        try {
          targetConfig = JSON.parse(rows[i][snapIdx]);
        } catch (e) {
          return { success: false, data: null, error: { code: 'CORRUPT_SNAPSHOT', message: 'Snapshot rusak' } };
        }
        break;
      }
    }

    if (!targetConfig) {
      return { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Versi riwayat tidak ditemukan' } };
    }

    return this.publishSiteConfig(targetConfig, 'Rollback ke versi ' + targetConfig.version + ' (' + historyId + ')', admin);
  },

  getSiteConfigHistory: function(admin) {
    var ss = Utilities_gs.getSpreadsheet();
    var sheet = ss.getSheetByName('CONFIG_HISTORY');
    if (!sheet) return { success: true, data: [] };

    var rows = Utilities_gs.sheetRowsToObjects(sheet);
    rows.sort(function(a, b) {
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    });

    var historyList = rows.map(function(r) {
      var parsed = null;
      try { parsed = JSON.parse(r.snapshot_json); } catch (e) {}
      return {
        historyId: r.history_id,
        version: r.version_number,
        publishedAt: r.published_at,
        publishedBy: r.published_by,
        summary: r.summary,
        configSnapshot: parsed
      };
    });

    return { success: true, data: historyList };
  },

  getDefaultConfig: function() {
    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Sistem Inisialisasi ADARUPA',
      brand: {
        appName: 'ADARUPA',
        descriptor: 'Jelajah Budaya Nusantara',
        tagline: 'Cerita yang Hidup, Budaya yang Terhubung.',
        brandDescription: 'Platform kebudayaan digital terbuka untuk melestarikan dan memperkenalkan kekayaan cerita rakyat, sandiwara audio, permainan tradisional, serta pagelaran budaya nusantara.',
        logoMode: 'symbol',
        logoImageUrl: '',
        alternateLogoUrl: '',
        faviconUrl: '',
        contactEmail: 'redaksi@adarupa.id',
        editorialCurator: 'Ghina (Kurator Budaya)'
      },
      theme: {
        primaryMaroon: '#800020',
        deepMaroon: '#590018',
        forestGreen: '#1B3A2F',
        warmGold: '#D4A373',
        ivoryBackground: '#F8F3E9',
        terracottaAccent: '#C65D3A',
        primaryText: '#292522',
        secondaryText: '#6D675F',
        borderColor: '#E5DED2',
        fontHeading: 'Playfair Display',
        fontBody: 'Plus Jakarta Sans',
        enableBatikPatterns: true
      },
      hero: {
        kickerBadge: 'Pilihan Budaya Nusantara',
        mainHeadline: 'Jelajahi Cerita dan Warisan Nusantara',
        supportingDescription: 'Menghidupkan kembali kearifan lokal melalui film cerita rakyat, sandiwara audio imersif, panduan permainan tradisional, dan agenda perhelatan budaya dari Sabang sampai Merauke.',
        primaryCtaLabel: 'Jelajahi Sekarang',
        primaryCtaLink: '/lalakon',
        secondaryCtaLabel: 'Temukan Pagelaran',
        secondaryCtaLink: '/pagelaran',
        bannerImageUrl: '',
        featuredCardLabel: 'Karya Unggulan'
      },
      sections: {
        fourDomainsTitle: 'Empat Ranah Budaya',
        fourDomainsSubtitle: 'Pilih medium penjelajahan warisan leluhur yang ingin Anda nikmati hari ini.',
        lalakonSectionKicker: 'Lalakon',
        lalakonSectionTitle: 'Kisah & Tutur Visual Nusantara',
        lalakonViewAllLabel: 'Lihat Semua Film',
        gemaSwaraSectionKicker: 'Gema Swara',
        gemaSwaraSectionTitle: 'Dengarkan Sekarang',
        gemaSwaraSectionSubtitle: 'Sandiwara radio legendaris, dongeng pengantar tidur, dan kidung dawai tradisi.',
        gemaSwaraViewAllLabel: 'Jelajahi Audio',
        gelanggangSectionKicker: 'Gelanggang',
        gelanggangSectionTitle: 'Jelajahi Permainan Tradisional',
        gelanggangViewAllLabel: 'Semua Tutorial Game',
        pagelaranSectionKicker: 'Pagelaran',
        pagelaranSectionTitle: 'Agenda Festival & Perhelatan Adat',
        pagelaranViewAllLabel: 'Kalender Lengkap'
      },
      navigation: [
        { id: 'nav_home', label: 'Beranda', path: '/', isVisible: true, order: 1 },
        { id: 'nav_lalakon', label: 'Lalakon', path: '/lalakon', isVisible: true, order: 2 },
        { id: 'nav_gema_swara', label: 'Gema Swara', path: '/gema-swara', isVisible: true, order: 3 },
        { id: 'nav_gelanggang', label: 'Gelanggang', path: '/gelanggang', isVisible: true, order: 4 },
        { id: 'nav_pagelaran', label: 'Pagelaran', path: '/pagelaran', isVisible: true, order: 5 }
      ],
      categories: [
        {
          slug: 'lalakon',
          displayName: 'Lalakon',
          description: 'Film dan kisah visual bertutur budaya nusantara dari berbagai penjuru kepulauan.',
          subtext: 'Cerita Rakyat, Legenda, Dokumenter, Animasi',
          displayOrder: 1,
          badgeLabel: 'Film & Visual'
        },
        {
          slug: 'gema-swara',
          displayName: 'Gema Swara',
          description: 'Dongeng audio, sandiwara radio, podcast budaya, dan kidung musik tradisi.',
          subtext: 'Tutur Tinular, Fabel Audio, Podcast Rempah',
          displayOrder: 2,
          badgeLabel: 'Audio & Sandiwara'
        },
        {
          slug: 'gelanggang',
          displayName: 'Gelanggang',
          description: 'Tutorial, aturan, dan ensiklopedia permainan tradisional warisan leluhur.',
          subtext: 'Congklak, Gobak Sodor, Egrang Bambu',
          displayOrder: 3,
          badgeLabel: 'Permainan Tradisional'
        },
        {
          slug: 'pagelaran',
          displayName: 'Pagelaran',
          description: 'Agenda festival budaya, pertunjukan seni panggung, dan upacara adat se-Indonesia.',
          subtext: 'Festival Payung, Pesta Kesenian Bali, Sekaten',
          displayOrder: 4,
          badgeLabel: 'Agenda & Festival'
        }
      ],
      staticPages: {
        aboutTitle: 'Tentang ADARUPA',
        aboutSubtitle: 'Merawat Akar Peradaban Melalui Medium Digital',
        aboutBody: 'ADARUPA lahir dari kesadaran mendalam bahwa kekayaan kearifan lokal kepulauan Indonesia—mulai dari sastra lisan, mitologi daerah, permainan rakyat, hingga ritual adat—perlu didokumentasikan dan disajikan secara bermartabat untuk generasi digital masa kini dan masa depan.',
        guidelinesTitle: 'Pedoman Konten Nusantara',
        guidelinesBody: '1. Penghormatan Adat: Setiap konten yang dipublikasikan wajib mencantumkan daerah asal, narasumber/penutur, dan konteks tradisi masyarakat aslinya.\n2. Inklusivitas & Edukasi: Materi disajikan dalam bahasa Indonesia yang santun, ramah keluarga, serta dapat diakses oleh pelajar dan pengajar di seluruh nusantara.\n3. Integritas Data: Rujukan faktual yang terverifikasi kurator.',
        privacyPolicyTitle: 'Kebijakan Privasi',
        privacyPolicyBody: 'ADARUPA berkomitmen melindungi privasi pengunjung situs web kami. Akses terhadap seluruh materi budaya publik tidak memerlukan registrasi akun atau pengumpulan data pribadi pengunjung.',
        termsOfUseTitle: 'Syarat dan Ketentuan Penggunaan',
        termsOfUseBody: 'Seluruh materi audio, video, teks panduan, dan gambar yang ditampilkan di ADARUPA dilindungi oleh hak cipta komunitas pencipta dan lisensi kebudayaan terbuka.'
      },
      uiStrings: {
        searchPlaceholder: 'Cari cerita rakyat, audio sandiwara, permainan tradisional, pagelaran...',
        searchButtonLabel: 'Cari Budaya...',
        searchModalKicker: 'Pencarian Khazanah Nusantara',
        noResultsFoundTitle: 'Tidak ada hasil yang sesuai',
        noResultsFoundDescription: 'Coba gunakan kata kunci nama daerah, judul cerita rakyat, atau jenis permainan lain.',
        resetFilterLabel: 'Atur Ulang Filter',
        loadingMessage: 'Memuat khazanah nusantara...',
        emptyCategoryMessage: 'Belum ada konten pada kategori ini.',
        shareSuccessMessage: 'Tautan Berhasil Disalin!',
        shareActionLabel: 'Bagikan',
        backToCatalogLabel: 'Kembali ke Katalog',
        playVideoLabel: 'Putar Video',
        playAudioLabel: 'Putar Audio',
        viewDetailsLabel: 'Lihat Rincian'
      },
      footer: {
        brandMissionText: 'Platform kebudayaan digital terbuka untuk melestarikan dan memperkenalkan kekayaan cerita rakyat, sandiwara audio, permainan tradisional, serta pagelaran budaya nusantara.',
        taglineQuote: 'Cerita yang Hidup, Budaya yang Terhubung.',
        culturalCategoriesHeading: 'Kategori Budaya',
        governanceHeading: 'Tentang & Tata Kelola',
        contactHeading: 'Kontak Redaksi',
        contactInvitationText: 'Memiliki arsip cerita rakyat atau dokumentasi permainan tradisional di daerah Anda? Kirimkan usulan melalui redaksi resmi.',
        copyrightText: 'ADARUPA — Jelajah Budaya Nusantara. Hak Cipta Dilindungi.',
        accessibilityNotice: 'Standar Aksesibilitas WCAG AA',
        privacyLinkText: 'Kebijakan Privasi',
        guidelinesLinkText: 'Pedoman Konten Nusantara',
        termsLinkText: 'Syarat Penggunaan'
      },
      seo: {
        metaTitle: 'ADARUPA — Jelajah Budaya Nusantara',
        metaDescription: 'Platform budaya digital Indonesia untuk menemukan film cerita rakyat, sandiwara audio, permainan tradisional, dan agenda pagelaran budaya nusantara.',
        ogTitle: 'ADARUPA — Jelajah Budaya Nusantara',
        ogDescription: 'Cerita yang Hidup, Budaya yang Terhubung.',
        ogImageUrl: ''
      }
    };
  }
};
