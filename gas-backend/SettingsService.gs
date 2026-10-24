/**
 * ADARUPA — SettingsService.gs
 * Public application settings from SETTINGS sheet.
 * Never exposes server secrets or script properties.
 */

var SettingsService = {
  getPublicSettings: function() {
    var ss = Utilities_gs.getSpreadsheet();
    var sheet = ss.getSheetByName('SETTINGS');
    var settings = {};

    if (sheet) {
      var rows = Utilities_gs.sheetRowsToObjects(sheet);
      rows.forEach(function(row) {
        if (row.setting_key && !row.setting_key.startsWith('SECRET_')) {
          settings[row.setting_key] = row.setting_value;
        }
      });
    }

    return {
      success: true,
      data: {
        app_name: settings['app_name'] || 'ADARUPA',
        descriptor: settings['descriptor'] || 'Jelajah Budaya Nusantara',
        tagline: settings['tagline'] || 'Cerita yang Hidup, Budaya yang Terhubung.',
        contact_email: settings['contact_email'] || 'redaksi@adarupa.id',
        allow_event_submissions: settings['allow_event_submissions'] === 'true'
      }
    };
  }
};
