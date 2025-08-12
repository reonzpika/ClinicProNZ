-- Session Management v2: Add recording flag and simplify mobile tokens
ALTER TABLE "patient_sessions" ADD COLUMN IF NOT EXISTS "is_recording" boolean DEFAULT false NOT NULL;

ALTER TABLE "mobile_tokens" ADD COLUMN IF NOT EXISTS "is_permanent" boolean DEFAULT true NOT NULL;
UPDATE "mobile_tokens" SET "is_permanent" = true WHERE "is_permanent" IS DISTINCT FROM true;

-- Remove legacy expiry to avoid security confusion
ALTER TABLE "mobile_tokens" DROP COLUMN IF EXISTS "expires_at";


