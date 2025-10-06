-- Create table to store user-defined display names and metadata for clinical images
CREATE TABLE IF NOT EXISTS clinical_image_metadata (
  image_key TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES patient_sessions(id) ON DELETE SET NULL,
  display_name TEXT,
  patient_name TEXT,
  identifier TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes to support common lookups
CREATE INDEX IF NOT EXISTS idx_clinimgmeta_user_id ON clinical_image_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_clinimgmeta_session_id ON clinical_image_metadata(session_id);
CREATE INDEX IF NOT EXISTS idx_clinimgmeta_user_session ON clinical_image_metadata(user_id, session_id);
