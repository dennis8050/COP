import { listMembers } from '../services/members.js';
import { json, errorResponse } from '../utils/http.js';
import { currentUser } from '../utils/auth.js';
export async function handler(event) {
  try {
    currentUser(event);
    const q = event.queryStringParameters || {};
    const rows = await listMembers({
      search: q.search || '',
      status: q.status || '',
      limit: Math.min(Number(q.limit || 100), 500),
      offset: Math.max(Number(q.offset || 0), 0)
    });
    return json(200, { data: rows });
  } catch (e) { return errorResponse(e); }
}
