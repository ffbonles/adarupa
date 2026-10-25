/**
 * ADARUPA — Vercel proxy to Google Apps Script
 *
 * Install at: /api/gas.ts (project root)
 * No Vercel Environment Variables required.
 *
 * This version handles the 302 redirect returned by Google Apps Script
 * explicitly. For GAS ContentService responses, Google commonly redirects
 * to script.googleusercontent.com; a redirected POST must be followed as GET.
 */

const GAS_WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbx7pX1eaIyyc6GyT1DnfkxLlLttFZrHuZ5QlrouudRfKOcRogGEKyry0kqpYjIvIpBODw/exec';

const ALLOWED_ACTIONS = new Set([
  'ping',
  'listCategories',
  'listSubcategories',
  'listContent',
  'getContentBySlug',
  'listFeaturedContent',
  'listRelatedContent',
  'listEvents',
  'getEventBySlug',
  'getPublicSettings',
  'getPublicSiteConfig',
  'requestAdminOtp',
  'verifyAdminOtp',
  'validateAdminSession',
  'revokeAdminSession',
  'getDraftSiteConfig',
  'saveDraftSiteConfig',
  'publishSiteConfig',
  'rollbackSiteConfig',
  'getSiteConfigHistory',
  'getAdminDashboardMetrics',
  'createContent',
  'updateContent',
  'updateContentPublicationStatus',
  'deleteContentMetadata',
  'listMediaAssets',
  'associateDriveAsset',
  'createEvent',
  'updateEvent',
  'updateEventPublicationStatus',
  'manageCategories'
]);

function sendJson(res: any, status: number, payload: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  return res.status(status).json(payload);
}

function failure(code: string, message: string, details?: any) {
  const result: any = {
    success: false,
    data: null,
    error: { code, message }
  };
  if (details) result.diagnostic = details;
  return result;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return sendJson(res, 405, failure('METHOD_NOT_ALLOWED', 'Metode tidak didukung.'));
  }

  try {
    const incomingUrl = new URL(req.url || '/', 'https://adarupa.local');
    let body: any = req.body;

    if (req.method === 'POST' && typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (_) {
        return sendJson(res, 400, failure('INVALID_JSON_BODY', 'Format JSON tidak valid.'));
      }
    }

    const action = String(
      (req.method === 'GET' ? incomingUrl.searchParams.get('action') : (body && body.action)) ||
      incomingUrl.searchParams.get('action') ||
      ''
    );

    if (!ALLOWED_ACTIONS.has(action)) {
      return sendJson(res, 400, failure('ACTION_NOT_ALLOWED', 'Aksi backend tidak dikenal atau tidak diizinkan.'));
    }

    const target = new URL(GAS_WEB_APP_URL);
    if (req.method === 'GET') {
      incomingUrl.searchParams.forEach((value, key) => target.searchParams.set(key, value));
      target.searchParams.set('action', action);
    } else {
      target.searchParams.set('action', action);
    }

    const headers: Record<string, string> = {
      Accept: 'application/json'
    };
    const init: RequestInit = {
      method: req.method,
      headers,
      redirect: 'manual'
    };

    if (req.method === 'POST') {
      if (!body || typeof body !== 'object' || Array.isArray(body)) body = {};
      body.action = action;
      headers['Content-Type'] = 'text/plain;charset=utf-8';
      init.body = JSON.stringify(body);
    }

    // First request goes to script.google.com.
    let upstream = await fetch(target.toString(), init);

    // GAS ContentService normally responds with 302 and a one-time response URL.
    // Follow that response explicitly; 302/303 converts POST into GET.
    if ([301, 302, 303, 307, 308].includes(upstream.status)) {
      const location = upstream.headers.get('location');
      if (!location) {
        return sendJson(res, 502, failure(
          'GAS_REDIRECT_NO_LOCATION',
          'GAS mengembalikan pengalihan tanpa alamat tujuan.',
          { upstreamStatus: upstream.status }
        ));
      }

      const redirectedUrl = new URL(location, target).toString();
      const preserveMethod = upstream.status === 307 || upstream.status === 308;
      const redirectInit: RequestInit = {
        method: preserveMethod ? req.method : 'GET',
        redirect: 'follow',
        headers: { Accept: 'application/json' }
      };

      if (preserveMethod && req.method === 'POST') {
        redirectInit.headers = {
          Accept: 'application/json',
          'Content-Type': 'text/plain;charset=utf-8'
        };
        redirectInit.body = JSON.stringify(body);
      }

      upstream = await fetch(redirectedUrl, redirectInit);
    }

    const responseText = await upstream.text();
    const contentType = upstream.headers.get('content-type') || 'unknown';

    let payload: any;
    try {
      payload = JSON.parse(responseText);
    } catch (_) {
      // Safe diagnostic only: do not return response body, redirect URL,
      // email, OTP, hash, or session token to the browser.
      const preview = responseText
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/https?:\/\/[^\s"'<>]+/gi, '[URL]')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 120);

      return sendJson(res, 502, failure(
        'GAS_INVALID_RESPONSE',
        'GAS tidak mengembalikan JSON. Periksa status dan tipe respons pada diagnostik.',
        {
          upstreamStatus: upstream.status,
          contentType,
          responsePreview: preview || '(respons kosong)'
        }
      ));
    }

    // Preserve the GAS application payload, including success:false errors.
    return sendJson(res, 200, payload);
  } catch (_) {
    // Do not expose internal URLs or credentials in exception text.
    return sendJson(res, 502, failure(
      'GAS_PROXY_FAILED',
      'Proxy Vercel tidak dapat menyelesaikan permintaan ke Google Apps Script.'
    ));
  }
}
