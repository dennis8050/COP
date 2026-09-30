import pg from 'pg';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { Pool } = pg;
const here = path.dirname(fileURLToPath(import.meta.url));
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

try {
  await pool.query(await fs.readFile(path.resolve(here, '../database/seed.sql'), 'utf8'));

  const user = await pool.query(`
    INSERT INTO users(name,email,role,cognito_user_id)
    VALUES('Development Admin','dev-admin@example.test','admin','local-dev-admin')
    ON CONFLICT (cognito_user_id) DO UPDATE SET name=EXCLUDED.name
    RETURNING id
  `);

  const members = await pool.query(
    "SELECT id FROM members WHERE status='active' ORDER BY last_name LIMIT 20"
  );
  const start = new Date('2026-09-06T00:00:00Z');
  for (let week = 0; week < 4; week++) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + week * 7);
    for (let i = 0; i < members.rows.length; i++) {
      const mod = (i + week) % 7;
      const status = mod === 0 ? 'absent' : mod === 1 ? 'excused' : 'present';
      await pool.query(`
        INSERT INTO attendance(member_id,attendance_date,service_type,status,recorded_by)
        VALUES($1,$2,'Sunday Service',$3,$4)
        ON CONFLICT (member_id,attendance_date) DO UPDATE SET status=EXCLUDED.status
      `, [members.rows[i].id, date.toISOString().slice(0,10), status, user.rows[0].id]);
    }
  }
  console.log('Seed complete.');
} finally {
  await pool.end();
}
