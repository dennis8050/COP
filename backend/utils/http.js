export function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,OPTIONS',
      ...extraHeaders
    },
    body: JSON.stringify(body)
  };
}

export function errorResponse(error) {
  if (error?.statusCode) return json(error.statusCode, { error: error.message });
  console.error('Unhandled error', { name: error?.name, message: error?.message });
  return json(500, { error: 'Internal server error' });
}

export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function parseBody(event) {
  if (!event.body) return {};
  try { return JSON.parse(event.body); }
  catch { throw new HttpError(400, 'Invalid JSON body'); }
}
