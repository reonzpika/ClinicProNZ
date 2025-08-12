-- Rollback for Session Management v2
ALTER TABLE "mobile_tokens" ADD COLUMN "expires_at" timestamp;
ALTER TABLE "mobile_tokens" DROP COLUMN IF EXISTS "is_permanent";
ALTER TABLE "patient_sessions" DROP COLUMN IF EXISTS "is_recording";


