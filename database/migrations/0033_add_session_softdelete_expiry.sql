-- Add soft-delete and expiry columns to patient_sessions
ALTER TABLE "patient_sessions" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
ALTER TABLE "patient_sessions" ADD COLUMN IF NOT EXISTS "expires_at" timestamp;

-- Backfill expires_at for existing active sessions to a sensible default (12h after created_at)
UPDATE "patient_sessions"
SET "expires_at" = COALESCE("expires_at", "created_at" + interval '12 hours')
WHERE "status" = 'active' AND "deleted_at" IS NULL;

