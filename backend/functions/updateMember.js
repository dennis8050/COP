import { updateMember } from '../services/members.js';
import { json, errorResponse, parseBody } from '../utils/http.js';
import { requireRole } from '../utils/auth.js';
import { memberSchema, parse } from '../utils/validation.js';
export async function handler(event) {
  try { requireRole(event,['admin']); const data=parse(memberSchema,parseBody(event)); return json(200,{data:await updateMember(event.pathParameters?.id,data)}); }
  catch(e){ return errorResponse(e); }
}
