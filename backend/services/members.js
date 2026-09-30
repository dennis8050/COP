import { query } from './db.js';
import { HttpError } from '../utils/http.js';

export async function listMembers({ search = '', status = '', limit = 100, offset = 0 }) {
  const values = [`%${search}%`];
  let where = `(first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1)`;
  if (status) { values.push(status); where += ` AND status=$${values.length}`; }
  values.push(limit, offset);
  const result = await query(`
    SELECT id, first_name, last_name, email, phone, date_of_birth,
           address, gender, membership_date, status, created_at, updated_at
    FROM members WHERE ${where}
    ORDER BY last_name, first_name
    LIMIT $${values.length-1} OFFSET $${values.length}
  `, values);
  return result.rows;
}

export async function getMember(id) {
  const result = await query('SELECT * FROM members WHERE id=$1', [id]);
  if (!result.rowCount) throw new HttpError(404, 'Member not found');
  return result.rows[0];
}

export async function createMember(member) {
  const result = await query(`
    INSERT INTO members
      (first_name,last_name,email,phone,date_of_birth,address,gender,membership_date,status)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
  `, [
    member.first_name, member.last_name, member.email || null, member.phone || null,
    member.date_of_birth || null, member.address || null, member.gender || null,
    member.membership_date, member.status
  ]);
  return result.rows[0];
}

export async function updateMember(id, member) {
  await getMember(id);
  const result = await query(`
    UPDATE members SET
      first_name=$1,last_name=$2,email=$3,phone=$4,date_of_birth=$5,
      address=$6,gender=$7,membership_date=$8,status=$9,updated_at=NOW()
    WHERE id=$10 RETURNING *
  `, [
    member.first_name, member.last_name, member.email || null, member.phone || null,
    member.date_of_birth || null, member.address || null, member.gender || null,
    member.membership_date, member.status, id
  ]);
  return result.rows[0];
}

export async function deactivateMember(id) {
  await getMember(id);
  const result = await query(
    `UPDATE members SET status='inactive',updated_at=NOW() WHERE id=$1 RETURNING *`, [id]
  );
  return result.rows[0];
}
