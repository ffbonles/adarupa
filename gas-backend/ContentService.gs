/**
 * ADARUPA — ContentService.gs
 * Manages Content metadata, pagination, and editorial controls.
 */

var ContentService = {
  listContent: function(options) {
    options = options || {};
    var ss = Utilities_gs.getSpreadsheet();
    var sheet = ss.getSheetByName('CONTENT');
    if (!sheet) return { success: true, data: [], meta: { total: 0 } };

    var allItems = Utilities_gs.sheetRowsToObjects(sheet);

    var filtered = allItems.filter(function(item) {
      if (options.status && item.publication_status !== options.status) return false;
      if (options.categoryId && item.category_id !== options.categoryId) return false;
      if (options.subcategoryId && item.subcategory_id !== options.subcategoryId) return false;
      if (options.region && String(item.origin_province).toLowerCase() !== String(options.region).toLowerCase()) return false;
      if (options.search) {
        var q = String(options.search).toLowerCase();
        var matchTitle = String(item.title).toLowerCase().indexOf(q) !== -1;
        var matchDesc = String(item.description).toLowerCase().indexOf(q) !== -1;
        var matchReg = String(item.origin_province).toLowerCase().indexOf(q) !== -1;
        if (!matchTitle && !matchDesc && !matchReg) return false;
      }
      return true;
    });

    var page = options.page || 1;
    var limit = options.limit || 12;
    var startIndex = (page - 1) * limit;
    var paged = filtered.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: paged,
      meta: {
        total: filtered.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(filtered.length / limit)
      }
    };
  },

  getContentBySlug: function(slug) {
    if (!slug) {
      return { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Slug tidak ditemukan' } };
    }

    var ss = Utilities_gs.getSpreadsheet();
    var sheet = ss.getSheetByName('CONTENT');
    var allItems = Utilities_gs.sheetRowsToObjects(sheet);

    for (var i = 0; i < allItems.length; i++) {
      if (allItems[i].slug === slug) {
        return { success: true, data: allItems[i] };
      }
    }

    return { success: false, data: null, error: { code: 'CONTENT_NOT_FOUND', message: 'Konten tidak ditemukan' } };
  },

  listFeaturedContent: function() {
    var ss = Utilities_gs.getSpreadsheet();
    var sheet = ss.getSheetByName('CONTENT');
    var allItems = Utilities_gs.sheetRowsToObjects(sheet);

    var featured = allItems.filter(function(item) {
      return item.publication_status === 'published' && (item.is_featured === true || item.is_featured === 'true');
    });

    return { success: true, data: featured };
  },

  listRelatedContent: function(contentId, categoryId) {
    var ss = Utilities_gs.getSpreadsheet();
    var sheet = ss.getSheetByName('CONTENT');
    var allItems = Utilities_gs.sheetRowsToObjects(sheet);

    var related = allItems.filter(function(item) {
      return item.content_id !== contentId && item.category_id === categoryId && item.publication_status === 'published';
    }).slice(0, 4);

    return { success: true, data: related };
  },

  createContent: function(data, admin) {
    var ss = Utilities_gs.getSpreadsheet();
    var sheet = ss.getSheetByName('CONTENT');
    var contentId = 'cnt_' + Utilities.getUuid().substring(0, 8);
    var now = new Date().toISOString();
    var slug = Validation.generateSlug(data.title);

    var row = [
      contentId,
      slug,
      data.title || 'Tanpa Judul',
      data.description || '',
      data.category_id || 'lalakon',
      data.subcategory_id || '',
      data.content_type || 'video',
      data.origin_province || '',
      data.origin_city || '',
      data.duration_seconds || 0,
      data.cover_file_id || '',
      data.primary_media_asset_id || '',
      data.series_id || '',
      data.publication_status || 'draft',
      data.is_featured ? true : false,
      data.publication_status === 'published' ? now : '',
      now,
      now,
      JSON.stringify(data.credits || {}),
      JSON.stringify(data.tutorial_data || {})
    ];

    sheet.appendRow(row);
    AuthService.logAction(admin.adminId, admin.email, 'CREATE_CONTENT', 'CONTENT', contentId, 'success', data.title);

    return {
      success: true,
      data: { content_id: contentId, slug: slug }
    };
  },

  updateContent: function(contentId, data, admin) {
    var ss = Utilities_gs.getSpreadsheet();
    var sheet = ss.getSheetByName('CONTENT');
    var rows = sheet.getDataRange().getValues();
    var headers = rows[0];
    var idIdx = headers.indexOf('content_id');

    for (var i = 1; i < rows.length; i++) {
      if (rows[i][idIdx] === contentId) {
        var now = new Date().toISOString();
        if (data.title) sheet.getRange(i + 1, headers.indexOf('title') + 1).setValue(data.title);
        if (data.description !== undefined) sheet.getRange(i + 1, headers.indexOf('description') + 1).setValue(data.description);
        if (data.category_id) sheet.getRange(i + 1, headers.indexOf('category_id') + 1).setValue(data.category_id);
        if (data.subcategory_id) sheet.getRange(i + 1, headers.indexOf('subcategory_id') + 1).setValue(data.subcategory_id);
        if (data.origin_province) sheet.getRange(i + 1, headers.indexOf('origin_province') + 1).setValue(data.origin_province);
        if (data.duration_seconds) sheet.getRange(i + 1, headers.indexOf('duration_seconds') + 1).setValue(data.duration_seconds);
        if (data.cover_file_id) sheet.getRange(i + 1, headers.indexOf('cover_file_id') + 1).setValue(data.cover_file_id);
        if (data.primary_media_asset_id) sheet.getRange(i + 1, headers.indexOf('primary_media_asset_id') + 1).setValue(data.primary_media_asset_id);
        if (data.publication_status) sheet.getRange(i + 1, headers.indexOf('publication_status') + 1).setValue(data.publication_status);
        if (data.is_featured !== undefined) sheet.getRange(i + 1, headers.indexOf('is_featured') + 1).setValue(Boolean(data.is_featured));
        sheet.getRange(i + 1, headers.indexOf('updated_at') + 1).setValue(now);

        AuthService.logAction(admin.adminId, admin.email, 'UPDATE_CONTENT', 'CONTENT', contentId, 'success');
        return { success: true, data: { content_id: contentId, updated: true } };
      }
    }

    return { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Konten tidak ditemukan' } };
  },

  updatePublicationStatus: function(contentId, status, admin) {
    return this.updateContent(contentId, { publication_status: status }, admin);
  },

  deleteContentMetadata: function(contentId, admin) {
    var ss = Utilities_gs.getSpreadsheet();
    var sheet = ss.getSheetByName('CONTENT');
    var rows = sheet.getDataRange().getValues();
    var idIdx = rows[0].indexOf('content_id');

    for (var i = 1; i < rows.length; i++) {
      if (rows[i][idIdx] === contentId) {
        sheet.deleteRow(i + 1);
        AuthService.logAction(admin.adminId, admin.email, 'DELETE_METADATA', 'CONTENT', contentId, 'success');
        return { success: true, data: { deleted: true, content_id: contentId } };
      }
    }
    return { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Konten tidak ditemukan' } };
  },

  getAdminMetrics: function() {
    var ss = Utilities_gs.getSpreadsheet();
    var contentSheet = ss.getSheetByName('CONTENT');
    var eventSheet = ss.getSheetByName('EVENTS');
    var mediaSheet = ss.getSheetByName('MEDIA_ASSETS');
    var auditSheet = ss.getSheetByName('AUDIT_LOG');

    var contents = Utilities_gs.sheetRowsToObjects(contentSheet);
    var events = Utilities_gs.sheetRowsToObjects(eventSheet);
    var media = Utilities_gs.sheetRowsToObjects(mediaSheet);
    var logs = Utilities_gs.sheetRowsToObjects(auditSheet).slice(-10).reverse();

    var publishedCount = contents.filter(function(c) { return c.publication_status === 'published'; }).length;
    var draftCount = contents.filter(function(c) { return c.publication_status === 'draft'; }).length;
    var upcomingEvents = events.filter(function(e) { return e.event_status === 'upcoming'; }).length;

    return {
      success: true,
      data: {
        total_published: publishedCount,
        total_drafts: draftCount,
        total_media: media.length,
        upcoming_events: upcomingEvents,
        recent_activity: logs
      }
    };
  }
};
