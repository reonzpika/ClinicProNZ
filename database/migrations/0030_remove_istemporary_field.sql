-- Remove isTemporary field from patient_sessions table
-- This field was used for tier-based temporary sessions which are no longer needed

ALTER TABLE "patient_sessions" DROP COLUMN IF EXISTS "is_temporary";
