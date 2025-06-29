-- Add typed_input and consultation_notes fields to patient_sessions table
ALTER TABLE "patient_sessions" ADD COLUMN "typed_input" text;
ALTER TABLE "patient_sessions" ADD COLUMN "consultation_notes" text; 