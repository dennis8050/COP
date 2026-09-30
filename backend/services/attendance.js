import { query } from './db.js';
import { HttpError } from '../utils/http.js';
import { getMember } from './members.js';

export async function listAttendance({ from, to, memberId, status }) {
  const values = [];
  const where = [];
  if (from) { values.push(from); where.push(`a.attendance_date >= $${values.length}`); }
  if (to) { values.push(to); where.push(`a.attendance_date <= $${values.length}`); }
  if (memberId) { values.push(memberId); where.push(`a.member_id = $${values.length}`); }
  if (status) { values.push(status); where.push(`a.status = $${values.length}`); }

  const result = await query(`
    SELECT a.*, m.first_name, m.last_name
    FROM attendance a
    JOIN members m ON m.id=a.member_id
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY a.attendance_date DESC, m.last_name, m.first_name
  `, values);
  return result.rows;
}

export async function recordAttendance(input, recordedBy) {
  const member = await getMember(input.member_id);
  if (member.status !== 'active') throw new HttpError(409, 'Inactive members cannot receive new attendance records');

  try {
    const result = await query(`
      INSERT INTO attendance(member_id,attendance_date,service_type,status,recorded_by)
      VALUES($1,$2,$3,$4,$5)
      RETURNING *
    `, [input.member_id,input.attendance_date,input.service_type,input.status,recordedBy]);
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') throw new HttpError(409, 'Attendance already exists for this member and date');
    throw error;
  }
}

export async function updateAttendance(id, input, recordedBy) {
  const existing = await query('SELECT * FROM attendance WHERE id=$1', [id]);
  if (!existing.rowCount) throw new HttpError(404, 'Attendance record not found');
  const member = await getMember(input.member_id);
  if (member.status !== 'active') throw new HttpError(409, 'Inactive members cannot receive attendance records');

  try {
    const result = await query(`
      UPDATE attendance
      SET member_id=$1,attendance_date=$2,service_type=$3,status=$4,recorded_by=$5,updated_at=NOW()
      WHERE id=$6 RETURNING *
    `, [input.member_id,input.attendance_date,input.service_type,input.status,recordedBy,id]);
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') throw new HttpError(409, 'Attendance already exists for this member and date');
    throw error;
  }
}

export async function history(memberId) {
  await getMember(memberId);
  const result = await query(`
    SELECT id, attendance_date, service_type, status, created_at
    FROM attendance
    WHERE member_id=$1
    ORDER BY attendance_date DESC
  `, [memberId]);
  return result.rows;
}
