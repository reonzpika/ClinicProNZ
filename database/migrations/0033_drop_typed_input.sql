-- Drop typed_input column from patient_sessions
ALTER TABLE "patient_sessions" DROP COLUMN IF EXISTS "typed_input";

