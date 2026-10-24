/**
 * ADARUPA — Validation.gs
 * Input normalization and validation helpers.
 */

var Validation = {
  isValidEmail: function(email) {
    if (!email || typeof email !== 'string') return false;
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim().toLowerCase());
  },

  sanitizeString: function(str) {
    if (!str) return '';
    return String(str).trim();
  },

  generateSlug: function(title) {
    if (!title) return 'konten-' + Date.now();
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  },

  isValidCategory: function(catId) {
    var valid = ['lalakon', 'gema-swara', 'gelanggang', 'pagelaran'];
    return valid.indexOf(catId) !== -1;
  },

  isValidEventStatus: function(status) {
    var valid = ['upcoming', 'ongoing', 'completed', 'postponed', 'canceled'];
    return valid.indexOf(status) !== -1;
  }
};
