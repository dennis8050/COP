import { query } from './db.js';

export async function dashboardStats(from, to) {
  const range = await query(`
    WITH active AS (
      SELECT COUNT(*)::int AS total FROM members WHERE status='active'
    ),
    a AS (
      SELECT
        COUNT(*) FILTER (WHERE status='present')::int AS present,
        COUNT(*) FILTER (WHERE status='absent')::int AS absent,
        COUNT(*) FILTER (WHERE status='excused')::int AS excused,
        COUNT(*)::int AS total
      FROM attendance
      WHERE ($1::date IS NULL OR attendance_date >= $1::date)
        AND ($2::date IS NULL OR attendance_date <= $2::date)
    )
    SELECT active.total AS active_members, a.present, a.absent, a.excused, a.total
    FROM active CROSS JOIN a
  `, [from || null, to || null]);

  const trends = await query(`
    SELECT DATE_TRUNC('week', attendance_date)::date AS week,
      COUNT(*) FILTER (WHERE status='present')::int AS present,
      COUNT(*)::int AS total
    FROM attendance
    WHERE ($1::date IS NULL OR attendance_date >= $1::date)
      AND ($2::date IS NULL OR attendance_date <= $2::date)
    GROUP BY 1 ORDER BY 1
  `, [from || null, to || null]);

  const row = range.rows[0];
  const pct = row.total ? Math.round((row.present / row.total) * 1000) / 10 : 0;
  return {
    activeMembers: row.active_members,
    present: row.present,
    absent: row.absent,
    excused: row.excused,
    totalAttendance: row.total,
    attendancePercentage: pct,
    trends: trends.rows
  };
}
