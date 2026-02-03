-- AI Clinical Review: store AI suggestion results and feedback for audit/analytics

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

ALTER TABLE "ai_suggestions" ADD CONSTRAINT "ai_suggestions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "ai_suggestions" ADD CONSTRAINT "ai_suggestions_session_id_patient_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "patient_sessions"("id") ON DELETE no action ON UPDATE no action;

CREATE INDEX IF NOT EXISTS "ai_suggestions_user_id_idx" ON "ai_suggestions" ("user_id");
CREATE INDEX IF NOT EXISTS "ai_suggestions_session_id_idx" ON "ai_suggestions" ("session_id");
CREATE INDEX IF NOT EXISTS "ai_suggestions_created_at_idx" ON "ai_suggestions" ("created_at");
