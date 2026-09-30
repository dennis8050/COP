import { deactivateMember } from '../services/members.js';
import { json, errorResponse } from '../utils/http.js';
import { requireRole } from '../utils/auth.js';
export async function handler(event) {
  try { requireRole(event,['admin']); return json(200,{data:await deactivateMember(event.pathParameters?.id)}); }
  catch(e){ return errorResponse(e); }
}
