import { query } from '../services/db.js';

const statements = [
`CREATE EXTENSION IF NOT EXISTS pgcrypto`,
`CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(160) NOT NULL,
  email VARCHAR(320) NOT NULL UNIQUE,
  role VARCHAR(32) NOT NULL CHECK (role IN ('admin', 'attendance_staff')),
  cognito_user_id VARCHAR(128) NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`,
`CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(320),
  phone VARCHAR(40),
  date_of_birth DATE,
  address TEXT,
  gender VARCHAR(32),
  membership_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(16) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`,
`CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  attendance_date DATE NOT NULL,
  service_type VARCHAR(100) NOT NULL DEFAULT 'Sunday Service',
  status VARCHAR(16) NOT NULL CHECK (status IN ('present', 'absent', 'excused')),
  recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT attendance_member_date_unique UNIQUE (member_id, attendance_date)
)`,
`CREATE INDEX IF NOT EXISTS idx_attendance_member_id ON attendance(member_id)`,
`CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date)`,
`CREATE INDEX IF NOT EXISTS idx_members_status ON members(status)`,
`CREATE INDEX IF NOT EXISTS idx_members_last_name ON members(last_name)`
];

export async function handler(event) {
  // This function is intentionally not exposed through API Gateway.
  // Invoke it only from an authorized deployment/operator workflow.
  if (process.env.MIGRATION_TOKEN && event?.migrationToken !== process.env.MIGRATION_TOKEN) {
    return { statusCode: 403, body: JSON.stringify({error:'Forbidden'}) };
  }
  try {
    for (const statement of statements) await query(statement);
    return { statusCode: 200, body: JSON.stringify({message:'Database migration completed'}) };
  } catch (error) {
    console.error('Migration failed', {name:error?.name, message:error?.message});
    throw error;
  }
}
