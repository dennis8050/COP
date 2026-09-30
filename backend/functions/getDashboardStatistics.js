import { dashboardStats } from '../services/dashboard.js';
import { json,errorResponse } from '../utils/http.js';
import { currentUser } from '../utils/auth.js';
export async function handler(event){
  try { currentUser(event); const q=event.queryStringParameters||{}; return json(200,{data:await dashboardStats(q.from,q.to)}); }
  catch(e){ return errorResponse(e); }
}
