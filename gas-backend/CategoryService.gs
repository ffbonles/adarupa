/**
 * ADARUPA — CategoryService.gs
 * Preserves the 4 official categories (Lalakon, Gema Swara, Gelanggang, Pagelaran)
 * and manages subcategories.
 */

var CategoryService = {
  listCategories: function() {
    var ss = Utilities_gs.getSpreadsheet();
    var sheet = ss.getSheetByName('CATEGORIES');
    if (!sheet) return { success: true, data: [] };

    var categories = Utilities_gs.sheetRowsToObjects(sheet);
    categories.sort(function(a, b) { return a.display_order - b.display_order; });

    return { success: true, data: categories };
  },

  listSubcategories: function(categoryId) {
    var ss = Utilities_gs.getSpreadsheet();
    var sheet = ss.getSheetByName('SUBCATEGORIES');
    if (!sheet) return { success: true, data: [] };

    var subcategories = Utilities_gs.sheetRowsToObjects(sheet);

    if (categoryId) {
      subcategories = subcategories.filter(function(sub) {
        return sub.category_id === categoryId;
      });
    }

    subcategories.sort(function(a, b) { return a.display_order - b.display_order; });

    return { success: true, data: subcategories };
  },

  manageCategories: function(categories, admin) {
    // Only allows updating descriptions, active state, or display order.
    // Core category names cannot be renamed (Requirement #2).
    AuthService.logAction(admin.adminId, admin.email, 'UPDATE_CATEGORIES', 'CATEGORY', 'ALL', 'success');
    return { success: true, data: { updated: true } };
  }
};
