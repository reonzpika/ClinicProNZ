-- Drop clinical_images column from patient_sessions table
-- This removes the legacy JSON field storage for clinical images

ALTER TABLE "patient_sessions" DROP COLUMN IF EXISTS "clinical_images";
