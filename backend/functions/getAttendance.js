import { listAttendance } from '../services/attendance.js';
import { json,errorResponse } from '../utils/http.js';
import { currentUser } from '../utils/auth.js';
export async function handler(event){
  try { currentUser(event); const q=event.queryStringParameters||{}; return json(200,{data:await listAttendance({from:q.from,to:q.to,memberId:q.memberId,status:q.status})}); }
  catch(e){ return errorResponse(e); }
}
