/**
 * ADARUPA — Vercel server-side proxy for Google Apps Script.
 *
 * Place this file at: /api/gas.ts (project root, not src/api).
 * No Vercel Environment Variable is required; the public GAS Web App URL
 * is configured directly below.
 *
 * The browser calls its own origin (/api/gas); this function calls GAS server-side,
 * avoiding browser CORS failures caused by Apps Script redirects.
 */
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

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({
      success: false,
      data: null,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Metode tidak didukung.' }
    });
  }

  // URL Web App GAS ADARUPA. URL Web App bukan kredensial rahasia.
  // Jika deployment GAS berubah, perbarui konstanta ini lalu deploy ulang Vercel.
  const gasUrl = 'https://script.google.com/macros/s/AKfycbx7pX1eaIyyc6GyT1DnfkxLlLttFZrHuZ5QlrouudRfKOcRogGEKyry0kqpYjIvIpBODw/exec';

  try {
    const incomingUrl = new URL(req.url || '/', 'https://adarupa.local');
    const action = String(
      (req.method === 'GET' ? incomingUrl.searchParams.get('action') : (req.body && req.body.action)) ||
      incomingUrl.searchParams.get('action') ||
      ''
    );

    if (!ALLOWED_ACTIONS.has(action)) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'ACTION_NOT_ALLOWED', message: 'Aksi backend tidak dikenal atau tidak diizinkan.' }
      });
    }

    const target = new URL(gasUrl);
    if (req.method === 'GET') {
      incomingUrl.searchParams.forEach((value, key) => target.searchParams.set(key, value));
      target.searchParams.set('action', action);
    } else {
      target.searchParams.set('action', action);
    }

    const init: RequestInit = {
      method: req.method,
      redirect: 'follow',
      headers: { Accept: 'application/json' }
    };

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (_) {
          return res.status(400).json({
            success: false,
            data: null,
            error: { code: 'INVALID_JSON_BODY', message: 'Format JSON tidak valid.' }
          });
        }
      }
      if (!body || typeof body !== 'object' || Array.isArray(body)) body = { action };
      body.action = action;
      init.headers = {
        Accept: 'application/json',
        'Content-Type': 'text/plain;charset=utf-8'
      };
      init.body = JSON.stringify(body);
    }

    const upstream = await fetch(target.toString(), init);
    const text = await upstream.text();

    let payload: any;
    try {
      payload = JSON.parse(text);
    } catch (_) {
      return res.status(502).json({
        success: false,
        data: null,
        error: {
          code: 'GAS_INVALID_RESPONSE',
          message: 'Respons GAS bukan JSON yang valid.'
        }
      });
    }

    // Return application-level response as JSON. Do not expose upstream URLs.
    return res.status(200).json(payload);
  } catch (error: any) {
    return res.status(502).json({
      success: false,
      data: null,
      error: {
        code: 'GAS_PROXY_FAILED',
        message: 'Proxy tidak dapat menghubungi Google Apps Script.'
      }
    });
  }
}
