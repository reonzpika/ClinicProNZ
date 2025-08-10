-- Persist the user's selected current session for mobile fallback
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "current_session_id" text;

