-- Add session tracking fields to users table
ALTER TABLE "users" ADD COLUMN "core_sessions_used" integer DEFAULT 0 NOT NULL;
ALTER TABLE "users" ADD COLUMN "session_reset_date" date DEFAULT CURRENT_DATE NOT NULL; 