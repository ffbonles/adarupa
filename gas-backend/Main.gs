/**
 * ADARUPA — Jelajah Budaya Nusantara
 * Google Apps Script Web App Entry Point
 *
 * Handles HTTP GET and POST requests, applies CORS headers,
 * and passes request handling to the Router module.
 */

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  try {
    var params = e && e.parameter ? e.parameter : {};
    var postData = null;

    if (method === 'POST' && e && e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        return createJsonResponse({
          success: false,
          data: null,
          error: {
            code: 'INVALID_JSON_BODY',
            message: 'Format data JSON tidak valid'
          }
        }, 400);
      }
    }

    var action = params.action || (postData && postData.action);
    if (!action) {
      return createJsonResponse({
        success: false,
        data: null,
        error: {
          code: 'MISSING_ACTION',
          message: 'Parameter action wajib disertakan'
        }
      }, 400);
    }

    var result = Router.dispatch(action, method, params, postData);
    return createJsonResponse(result);

  } catch (err) {
    return createJsonResponse({
      success: false,
      data: null,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: err.message || 'Terjadi kesalahan internal pada server'
      }
    }, 500);
  }
}

function createJsonResponse(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
