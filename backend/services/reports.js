import { query } from './db.js';

export async function report({ from, to, memberId, status }) {
  const values = [];
  const where = [];
  if (from) { values.push(from); where.push(`a.attendance_date >= $${values.length}`); }
  if (to) { values.push(to); where.push(`a.attendance_date <= $${values.length}`); }
  if (memberId) { values.push(memberId); where.push(`a.member_id = $${values.length}`); }
  if (status) { values.push(status); where.push(`a.status = $${values.length}`); }

  const rows = await query(`
    SELECT a.attendance_date, a.service_type, a.status,
           m.id AS member_id, m.first_name, m.last_name
    FROM attendance a
    JOIN members m ON m.id=a.member_id
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY a.attendance_date DESC, m.last_name, m.first_name
  `, values);

  const total = rows.rowCount;
  const present = rows.rows.filter(r => r.status === 'present').length;
  const absent = rows.rows.filter(r => r.status === 'absent').length;
  const excused = rows.rows.filter(r => r.status === 'excused').length;

  return {
    summary: {
      totalAttendance: total,
      present,
      absent,
      excused,
      attendancePercentage: total ? Math.round((present / total) * 1000) / 10 : 0
    },
    rows: rows.rows
  };
}
