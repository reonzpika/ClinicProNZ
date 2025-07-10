DROP TABLE "recording_tokens" CASCADE;--> statement-breakpoint
ALTER TABLE "patient_sessions" ADD COLUMN "typed_input" text;--> statement-breakpoint
ALTER TABLE "patient_sessions" ADD COLUMN "consultation_notes" text;