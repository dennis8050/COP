import { report } from '../services/reports.js';
import { json,errorResponse } from '../utils/http.js';
import { requireRole } from '../utils/auth.js';
export async function handler(event){
  try { requireRole(event,['admin']); const q=event.queryStringParameters||{}; return json(200,{data:await report({from:q.from,to:q.to,memberId:q.memberId,status:q.status})}); }
  catch(e){ return errorResponse(e); }
}
