/**
 * ADARUPA — Router.gs
 * Dispatches public and authenticated actions to specific services.
 */

var Router = {
  dispatch: function(action, method, params, postData) {
    // Public Read Operations
    switch (action) {
      case 'ping':
        return {
          success: true,
          data: {
            app: 'ADARUPA',
            version: '1.0.0',
            serverTime: new Date().toISOString(),
            status: 'operational'
          }
        };

      case 'listCategories':
        return CategoryService.listCategories();

      case 'listSubcategories':
        return CategoryService.listSubcategories(params.categoryId);

      case 'listContent':
        return ContentService.listContent({
          categoryId: params.categoryId,
          subcategoryId: params.subcategoryId,
          region: params.region,
          status: 'published',
          search: params.q,
          page: parseInt(params.page || '1', 10),
          limit: parseInt(params.limit || '12', 10)
        });

      case 'getContentBySlug':
        return ContentService.getContentBySlug(params.slug);

      case 'listFeaturedContent':
        return ContentService.listFeaturedContent();

      case 'listRelatedContent':
        return ContentService.listRelatedContent(params.contentId, params.categoryId);

      case 'listEvents':
        return EventService.listEvents({
          category: params.category,
          province: params.province,
          status: params.status,
          search: params.q,
          page: parseInt(params.page || '1', 10),
          limit: parseInt(params.limit || '12', 10)
        });

      case 'getEventBySlug':
        return EventService.getEventBySlug(params.slug);

      case 'getPublicSettings':
        return SettingsService.getPublicSettings();

      case 'getPublicSiteConfig':
        return SiteContentService.getPublicSiteConfig();

      // Administrator Authentication Operations
      case 'requestAdminOtp':
        var email = postData ? postData.email : params.email;
        return AuthService.requestOtp(email);

      case 'verifyAdminOtp':
        var verifyEmail = postData ? postData.email : params.email;
        var otpCode = postData ? postData.otp : params.otp;
        return AuthService.verifyOtp(verifyEmail, otpCode);

      case 'validateAdminSession':
        var token = postData ? postData.token : params.token;
        return AuthService.validateSession(token);

      case 'revokeAdminSession':
        var revokeToken = postData ? postData.token : params.token;
        return AuthService.revokeSession(revokeToken);

      // Authenticated Administrator Operations (Require Valid Session Token)
      case 'getDraftSiteConfig':
        var draftAuth = AuthService.requireAuth(params, postData);
        return SiteContentService.getDraftSiteConfig(draftAuth);

      case 'saveDraftSiteConfig':
        var saveDraftAuth = AuthService.requireAuth(params, postData);
        return SiteContentService.saveDraftSiteConfig(postData.config, saveDraftAuth);

      case 'publishSiteConfig':
        var pubConfigAuth = AuthService.requireAuth(params, postData);
        return SiteContentService.publishSiteConfig(postData.config, postData.summary, pubConfigAuth);

      case 'rollbackSiteConfig':
        var rbAuth = AuthService.requireAuth(params, postData);
        return SiteContentService.rollbackSiteConfig(postData.historyId, rbAuth);

      case 'getSiteConfigHistory':
        var histAuth = AuthService.requireAuth(params, postData);
        return SiteContentService.getSiteConfigHistory(histAuth);

      case 'getAdminDashboardMetrics':
        AuthService.requireAuth(params, postData);
        return ContentService.getAdminMetrics();

      case 'createContent':
        var adminAuth = AuthService.requireAuth(params, postData);
        return ContentService.createContent(postData.content, adminAuth);

      case 'updateContent':
        var updateAuth = AuthService.requireAuth(params, postData);
        return ContentService.updateContent(postData.contentId, postData.content, updateAuth);

      case 'updateContentPublicationStatus':
        var pubAuth = AuthService.requireAuth(params, postData);
        return ContentService.updatePublicationStatus(postData.contentId, postData.status, pubAuth);

      case 'deleteContentMetadata':
        var delAuth = AuthService.requireAuth(params, postData);
        return ContentService.deleteContentMetadata(postData.contentId, delAuth);

      case 'listMediaAssets':
        AuthService.requireAuth(params, postData);
        return MediaService.listMediaAssets();

      case 'associateDriveAsset':
        var mediaAuth = AuthService.requireAuth(params, postData);
        return MediaService.associateDriveAsset(postData.asset, mediaAuth);

      case 'createEvent':
        var evCreateAuth = AuthService.requireAuth(params, postData);
        return EventService.createEvent(postData.event, evCreateAuth);

      case 'updateEvent':
        var evUpdateAuth = AuthService.requireAuth(params, postData);
        return EventService.updateEvent(postData.eventId, postData.event, evUpdateAuth);

      case 'updateEventPublicationStatus':
        var evPubAuth = AuthService.requireAuth(params, postData);
        return EventService.updatePublicationStatus(postData.eventId, postData.status, evPubAuth);

      case 'manageCategories':
        var catAuth = AuthService.requireAuth(params, postData);
        return CategoryService.manageCategories(postData.categories, catAuth);

      default:
        return {
          success: false,
          data: null,
          error: {
            code: 'UNKNOWN_ACTION',
            message: 'Aksi "' + action + '" tidak dikenali oleh sistem'
          }
        };
    }
  }
};
