-- Add ai_suggestions table for AI review (red flags, ddx, investigations, management) logging and feedback
-- Idempotent: safe to run when the table already exists (no-op for existing objects).

CREATE TABLE IF NOT EXISTS "ai_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"session_id" uuid,
	"review_type" text NOT NULL,
	"note_content" text NOT NULL,
	"ai_response" text NOT NULL,
	"user_feedback" text,
	"response_time_ms" integer NOT NULL,
	"input_tokens" integer NOT NULL,
	"output_tokens" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign keys only if they do not exist
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_suggestions_user_id_users_id_fk') THEN
		ALTER TABLE "ai_suggestions" ADD CONSTRAINT "ai_suggestions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE no action;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_suggestions_session_id_patient_sessions_id_fk') THEN
		ALTER TABLE "ai_suggestions" ADD CONSTRAINT "ai_suggestions_session_id_patient_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "patient_sessions"("id") ON UPDATE no action;
	END IF;
END $$;

CREATE INDEX IF NOT EXISTS "ai_suggestions_user_id_idx" ON "ai_suggestions" ("user_id");
CREATE INDEX IF NOT EXISTS "ai_suggestions_session_id_idx" ON "ai_suggestions" ("session_id");
CREATE INDEX IF NOT EXISTS "ai_suggestions_created_at_idx" ON "ai_suggestions" ("created_at");
