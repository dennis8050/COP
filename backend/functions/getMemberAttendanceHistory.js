import { history } from '../services/attendance.js';
import { json,errorResponse } from '../utils/http.js';
import { currentUser } from '../utils/auth.js';
export async function handler(event){
  try { currentUser(event); return json(200,{data:await history(event.pathParameters?.id)}); }
  catch(e){ return errorResponse(e); }
}
