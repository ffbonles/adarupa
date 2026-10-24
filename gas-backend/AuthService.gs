/**
 * ADARUPA — AuthService.gs
 * Secure Email OTP Authentication and Session Management.
 * Meets requirements:
 * - 6-digit OTP
 * - 10-minute expiry
 * - 60s resend cooldown
 * - Max 5 attempts
 * - Plaintext OTP never stored persistently
 * - Session verification on all write operations
 */

var AuthService = {
  OTP_EXPIRY_MS: 10 * 60 * 1000, // 10 minutes
  RESEND_COOLDOWN_MS: 60 * 1000,  // 60 seconds
  MAX_ATTEMPTS: 5,
  SESSION_EXPIRY_MS: 8 * 60 * 60 * 1000, // 8 hours

  requestOtp: function(email) {
    if (!Validation.isValidEmail(email)) {
      return {
        success: false,
        data: null,
        error: { code: 'INVALID_EMAIL', message: 'Alamat surel tidak valid' }
      };
    }

    var cleanEmail = email.trim().toLowerCase();
    var admin = this.getAdminByEmail(cleanEmail);

    // Generic response to avoid revealing registered emails if admin not found
    if (!admin || admin.account_status !== 'active') {
      return {
        success: true,
        data: {
          sent: true,
          message: 'Jika alamat surel terdaftar sebagai administrator, kode OTP telah dikirimkan.'
        }
      };
    }

    var scriptProperties = PropertiesService.getScriptProperties();
    var lastSentKey = 'OTP_SENT_' + cleanEmail;
    var lastSent = scriptProperties.getProperty(lastSentKey);
    var now = Date.now();

    if (lastSent && (now - parseInt(lastSent, 10) < this.RESEND_COOLDOWN_MS)) {
      var remainingSeconds = Math.ceil((this.RESEND_COOLDOWN_MS - (now - parseInt(lastSent, 10))) / 1000);
      return {
        success: false,
        data: null,
        error: {
          code: 'RATE_LIMITED',
          message: 'Mohon tunggu ' + remainingSeconds + ' detik sebelum meminta kode OTP kembali.'
        }
      };
    }

    // Generate random 6-digit OTP
    var otpNumber = Math.floor(100000 + Math.random() * 900000);
    var otpString = String(otpNumber);

    // Hash OTP before storage using Utilities.computeDigest
    var hashedOtp = Utilities.base64Encode(
      Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, otpString + '_adarupa_salt')
    );

    var otpData = {
      hash: hashedOtp,
      expiresAt: now + this.OTP_EXPIRY_MS,
      attempts: 0,
      email: cleanEmail
    };

    scriptProperties.setProperty('OTP_DATA_' + cleanEmail, JSON.stringify(otpData));
    scriptProperties.setProperty(lastSentKey, String(now));

    // Send email via MailApp
    try {
      MailApp.sendEmail({
        to: cleanEmail,
        subject: '[ADARUPA] Kode OTP Masuk Administrator',
        body: 'Halo ' + admin.display_name + ',\n\n' +
              'Kode OTP verifikasi masuk administrator ADARUPA Anda adalah:\n\n' +
              otpString + '\n\n' +
              'Kode ini berlaku selama 10 menit. Jangan berikan kode ini kepada siapapun.\n\n' +
              'Salam,\nTim ADARUPA — Jelajah Budaya Nusantara'
      });
    } catch (mailErr) {
      // Log failure in quota or delivery
      return {
        success: false,
        data: null,
        error: {
          code: 'EMAIL_SEND_FAILED',
          message: 'Pengiriman surel gagal: ' + mailErr.message
        }
      };
    }

    return {
      success: true,
      data: {
        sent: true,
        message: 'Kode OTP telah dikirimkan ke surel administrator.'
      }
    };
  },

  verifyOtp: function(email, otp) {
    if (!email || !otp) {
      return {
        success: false,
        data: null,
        error: { code: 'MISSING_FIELDS', message: 'Surel dan kode OTP wajib diisi' }
      };
    }

    var cleanEmail = email.trim().toLowerCase();
    var scriptProperties = PropertiesService.getScriptProperties();
    var storedRaw = scriptProperties.getProperty('OTP_DATA_' + cleanEmail);

    if (!storedRaw) {
      return {
        success: false,
        data: null,
        error: { code: 'OTP_NOT_FOUND', message: 'Kode OTP tidak ditemukan atau telah kedaluwarsa' }
      };
    }

    var otpData = JSON.parse(storedRaw);
    var now = Date.now();

    if (now > otpData.expiresAt) {
      scriptProperties.deleteProperty('OTP_DATA_' + cleanEmail);
      return {
        success: false,
        data: null,
        error: { code: 'OTP_EXPIRED', message: 'Kode OTP telah kedaluwarsa. Silakan minta kode baru.' }
      };
    }

    if (otpData.attempts >= this.MAX_ATTEMPTS) {
      scriptProperties.deleteProperty('OTP_DATA_' + cleanEmail);
      return {
        success: false,
        data: null,
        error: { code: 'TOO_MANY_ATTEMPTS', message: 'Batas percobaan verifikasi telah terlampaui.' }
      };
    }

    var hashedInput = Utilities.base64Encode(
      Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(otp).trim() + '_adarupa_salt')
    );

    if (hashedInput !== otpData.hash) {
      otpData.attempts = (otpData.attempts || 0) + 1;
      scriptProperties.setProperty('OTP_DATA_' + cleanEmail, JSON.stringify(otpData));
      return {
        success: false,
        data: null,
        error: {
          code: 'INVALID_OTP',
          message: 'Kode OTP salah. Sisa percobaan: ' + (this.MAX_ATTEMPTS - otpData.attempts)
        }
      };
    }

    // OTP verified successfully. Clean up used OTP immediately.
    scriptProperties.deleteProperty('OTP_DATA_' + cleanEmail);

    var admin = this.getAdminByEmail(cleanEmail);
    var token = 'tok_' + Utilities.getUuid();
    var sessionData = {
      token: token,
      adminId: admin.admin_id,
      email: admin.email,
      displayName: admin.display_name,
      role: admin.role,
      expiresAt: now + this.SESSION_EXPIRY_MS
    };

    scriptProperties.setProperty('SESSION_' + token, JSON.stringify(sessionData));

    // Audit log
    this.logAction(admin.admin_id, admin.email, 'LOGIN_OTP', 'AUTH', admin.admin_id, 'success');

    return {
      success: true,
      data: {
        session: sessionData
      }
    };
  },

  validateSession: function(token) {
    if (!token) {
      return { success: false, data: null, error: { code: 'UNAUTHORIZED', message: 'Sesi tidak valid' } };
    }

    var scriptProperties = PropertiesService.getScriptProperties();
    var sessionRaw = scriptProperties.getProperty('SESSION_' + token);

    if (!sessionRaw) {
      return { success: false, data: null, error: { code: 'SESSION_EXPIRED', message: 'Sesi telah berakhir' } };
    }

    var session = JSON.parse(sessionRaw);
    if (Date.now() > session.expiresAt) {
      scriptProperties.deleteProperty('SESSION_' + token);
      return { success: false, data: null, error: { code: 'SESSION_EXPIRED', message: 'Sesi telah berakhir' } };
    }

    return { success: true, data: { session: session } };
  },

  revokeSession: function(token) {
    if (token) {
      PropertiesService.getScriptProperties().deleteProperty('SESSION_' + token);
    }
    return { success: true, data: { revoked: true } };
  },

  requireAuth: function(params, postData) {
    var token = (postData && postData.token) || (params && params.token);
    var valid = this.validateSession(token);
    if (!valid.success) {
      throw new Error('UNAUTHORIZED: Akses administrator diperlukan');
    }
    return valid.data.session;
  },

  getAdminByEmail: function(email) {
    var ss = Utilities_gs.getSpreadsheet();
    var sheet = ss.getSheetByName('ADMINS');
    if (!sheet) return null;

    var rows = sheet.getDataRange().getValues();
    if (rows.length < 2) return null;

    var headers = rows[0];
    var emailIdx = headers.indexOf('email');
    var idIdx = headers.indexOf('admin_id');
    var nameIdx = headers.indexOf('display_name');
    var roleIdx = headers.indexOf('role');
    var statusIdx = headers.indexOf('account_status');

    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      if (String(row[emailIdx]).trim().toLowerCase() === email) {
        return {
          admin_id: row[idIdx],
          email: row[emailIdx],
          display_name: row[nameIdx],
          role: row[roleIdx],
          account_status: row[statusIdx]
        };
      }
    }
    return null;
  },

  logAction: function(adminId, adminEmail, action, resourceType, resourceId, result, details) {
    try {
      var ss = Utilities_gs.getSpreadsheet();
      var sheet = ss.getSheetByName('AUDIT_LOG');
      if (sheet) {
        sheet.appendRow([
          'log_' + Utilities.getUuid().substring(0, 8),
          adminId || '',
          action,
          resourceType,
          resourceId,
          new Date().toISOString(),
          result,
          details || ''
        ]);
      }
    } catch (e) {
      // Non-fatal audit log failure
    }
  }
};
