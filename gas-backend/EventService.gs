/**
 * ADARUPA — EventService.gs
 * Manages Pagelaran cultural events, dates, venue validation, and status lifecycle.
 */

var EventService = {
  listEvents: function(options) {
    options = options || {};
    var ss = Utilities_gs.getSpreadsheet();
    var sheet = ss.getSheetByName('EVENTS');
    if (!sheet) return { success: true, data: [] };

    var allEvents = Utilities_gs.sheetRowsToObjects(sheet);
    var now = new Date();

    // Auto-calculate event_status based on current time
    allEvents.forEach(function(ev) {
      if (ev.event_status !== 'canceled' && ev.event_status !== 'postponed') {
        var start = new Date(ev.start_datetime);
        var end = new Date(ev.end_datetime);
        if (now < start) {
          ev.event_status = 'upcoming';
        } else if (now >= start && now <= end) {
          ev.event_status = 'ongoing';
        } else {
          ev.event_status = 'completed';
        }
      }
    });

    var filtered = allEvents.filter(function(ev) {
      if (ev.publication_status !== 'published') return false;
      if (options.category && ev.category !== options.category) return false;
      if (options.province && String(ev.province).toLowerCase() !== String(options.province).toLowerCase()) return false;
      if (options.status && ev.event_status !== options.status) return false;
      if (options.search) {
        var q = String(options.search).toLowerCase();
        var matchTitle = String(ev.title).toLowerCase().indexOf(q) !== -1;
        var matchVenue = String(ev.venue).toLowerCase().indexOf(q) !== -1;
        var matchCity = String(ev.city).toLowerCase().indexOf(q) !== -1;
        if (!matchTitle && !matchVenue && !matchCity) return false;
      }
      return true;
    });

    // Sort upcoming events chronologically
    filtered.sort(function(a, b) {
      return new Date(a.start_datetime) - new Date(b.start_datetime);
    });

    return {
      success: true,
      data: filtered,
      meta: { total: filtered.length }
    };
  },

  getEventBySlug: function(slug) {
    var ss = Utilities_gs.getSpreadsheet();
    var sheet = ss.getSheetByName('EVENTS');
    var allEvents = Utilities_gs.sheetRowsToObjects(sheet);

    for (var i = 0; i < allEvents.length; i++) {
      if (allEvents[i].slug === slug) {
        return { success: true, data: allEvents[i] };
      }
    }
    return { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Pagelaran tidak ditemukan' } };
  },

  createEvent: function(data, admin) {
    var ss = Utilities_gs.getSpreadsheet();
    var sheet = ss.getSheetByName('EVENTS');
    var eventId = 'ev_' + Utilities.getUuid().substring(0, 8);
    var now = new Date().toISOString();
    var slug = Validation.generateSlug(data.title);

    var row = [
      eventId,
      slug,
      data.title || 'Agenda Budaya Baru',
      data.description || '',
      data.category || 'Festival Budaya',
      data.province || '',
      data.city || '',
      data.venue || '',
      data.address || '',
      data.start_datetime || now,
      data.end_datetime || now,
      data.organizer || '',
      data.poster_file_id || '',
      data.official_source_url || '',
      data.registration_url || '',
      data.verification_status || 'verified',
      data.publication_status || 'published',
      data.event_status || 'upcoming',
      now,
      now
    ];

    sheet.appendRow(row);
    AuthService.logAction(admin.adminId, admin.email, 'CREATE_EVENT', 'EVENT', eventId, 'success', data.title);

    return { success: true, data: { event_id: eventId, slug: slug } };
  },

  updateEvent: function(eventId, data, admin) {
    var ss = Utilities_gs.getSpreadsheet();
    var sheet = ss.getSheetByName('EVENTS');
    var rows = sheet.getDataRange().getValues();
    var headers = rows[0];
    var idIdx = headers.indexOf('event_id');

    for (var i = 1; i < rows.length; i++) {
      if (rows[i][idIdx] === eventId) {
        var now = new Date().toISOString();
        for (var key in data) {
          var colIdx = headers.indexOf(key);
          if (colIdx !== -1) {
            sheet.getRange(i + 1, colIdx + 1).setValue(data[key]);
          }
        }
        sheet.getRange(i + 1, headers.indexOf('updated_at') + 1).setValue(now);
        AuthService.logAction(admin.adminId, admin.email, 'UPDATE_EVENT', 'EVENT', eventId, 'success');
        return { success: true, data: { event_id: eventId, updated: true } };
      }
    }
    return { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Pagelaran tidak ditemukan' } };
  },

  updatePublicationStatus: function(eventId, status, admin) {
    return this.updateEvent(eventId, { publication_status: status }, admin);
  }
};
