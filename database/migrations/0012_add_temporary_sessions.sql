-- Add isTemporary field to patient_sessions table to support basic tier temporary sessions
ALTER TABLE patient_sessions ADD COLUMN is_temporary BOOLEAN DEFAULT FALSE NOT NULL; 