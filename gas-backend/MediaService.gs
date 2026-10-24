/**
 * ADARUPA — MediaService.gs
 * Manages Google Drive file asset associations, MIME types, and status checks.
 * Note: Never streams large binary files through GAS (meets requirement #8 & #15).
 */

var MediaService = {
  listMediaAssets: function() {
    var ss = Utilities_gs.getSpreadsheet();
    var sheet = ss.getSheetByName('MEDIA_ASSETS');
    if (!sheet) return { success: true, data: [] };

    var assets = Utilities_gs.sheetRowsToObjects(sheet);
    return { success: true, data: assets };
  },

  associateDriveAsset: function(data, admin) {
    if (!data.drive_file_id) {
      return { success: false, data: null, error: { code: 'MISSING_FILE_ID', message: 'ID Berkas Google Drive wajib diisi' } };
    }

    var ss = Utilities_gs.getSpreadsheet();
    var sheet = ss.getSheetByName('MEDIA_ASSETS');
    var assetId = 'med_' + Utilities.getUuid().substring(0, 8);
    var now = new Date().toISOString();

    // Verify Google Drive file accessibility via DriveApp
    var fileName = data.file_name || 'Berkas Budaya';
    var mimeType = data.mime_type || 'video/mp4';
    var availability = 'available';

    try {
      var file = DriveApp.getFileById(data.drive_file_id);
      fileName = file.getName();
      mimeType = file.getMimeType();
      var access = file.getSharingAccess();
      if (access !== DriveApp.Access.ANYONE && access !== DriveApp.Access.ANYONE_WITH_LINK) {
        availability = 'restricted';
      }
    } catch (driveErr) {
      availability = 'inaccessible';
    }

    var row = [
      assetId,
      data.content_id || '',
      data.drive_file_id,
      fileName,
      mimeType,
      data.file_size || '',
      data.asset_role || 'primary_media',
      availability === 'restricted' ? 'restricted' : 'public',
      availability,
      now,
      now
    ];

    sheet.appendRow(row);
    AuthService.logAction(admin.adminId, admin.email, 'ASSOCIATE_MEDIA', 'MEDIA_ASSET', assetId, 'success', fileName);

    return {
      success: true,
      data: {
        media_asset_id: assetId,
        file_name: fileName,
        mime_type: mimeType,
        availability_status: availability
      }
    };
  }
};
