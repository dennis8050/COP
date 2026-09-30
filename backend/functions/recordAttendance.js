import { recordAttendance } from '../services/attendance.js';
import { json,errorResponse,parseBody } from '../utils/http.js';
import { requireRole } from '../utils/auth.js';
import { attendanceSchema,parse } from '../utils/validation.js';
import { query } from '../services/db.js';
export async function handler(event){
  try {
    const user=requireRole(event,['admin','attendance_staff']);
    const u=await query('SELECT id FROM users WHERE cognito_user_id=$1 AND active=true',[user.cognitoUserId]);
    if(!u.rowCount) throw Object.assign(new Error('User profile not provisioned'),{statusCode:403});
    const data=parse(attendanceSchema,parseBody(event));
    return json(201,{data:await recordAttendance(data,u.rows[0].id)});
  } catch(e){ return errorResponse(e); }
}
