-- Create append-only transcription_chunks table
CREATE TABLE IF NOT EXISTS "transcription_chunks" (
  "id" bigserial PRIMARY KEY,
  "session_id" uuid NOT NULL,
  "user_id" text NOT NULL,
  "chunk_id" uuid NOT NULL,
  "text" text NOT NULL,
  "source" text NOT NULL DEFAULT 'desktop',
  "device_id" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "transcription_chunks_session_id_patient_sessions_id_fk"
    FOREIGN KEY ("session_id") REFERENCES "patient_sessions"("id") ON DELETE CASCADE,
  CONSTRAINT "transcription_chunks_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "transcription_chunks_session_id_chunk_id_unique" UNIQUE ("session_id", "chunk_id")
);

-- Helpful index for incremental fetches
CREATE INDEX IF NOT EXISTS "idx_transcription_chunks_session_id_id"
  ON "transcription_chunks" ("session_id", "id");

