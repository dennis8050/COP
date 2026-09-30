-- Service type was included in the initial attendance table for fresh installs.
-- This migration is intentionally idempotent for environments upgraded from
-- an earlier schema that did not have the column.
ALTER TABLE attendance
  ADD COLUMN IF NOT EXISTS service_type VARCHAR(100) NOT NULL DEFAULT 'Sunday Service';
