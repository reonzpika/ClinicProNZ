-- Add context_text field to patient_sessions table
ALTER TABLE "patient_sessions" ADD COLUMN IF NOT EXISTS "context_text" text;
