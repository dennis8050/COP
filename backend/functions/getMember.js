import { getMember } from '../services/members.js';
import { json, errorResponse } from '../utils/http.js';
import { currentUser } from '../utils/auth.js';
export async function handler(event) {
  try { currentUser(event); return json(200,{data:await getMember(event.pathParameters?.id)}); }
  catch(e){ return errorResponse(e); }
}
