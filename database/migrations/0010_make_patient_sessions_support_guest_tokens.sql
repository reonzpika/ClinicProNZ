-- Support guest tokens in patient_sessions table
ALTER TABLE "patient_sessions" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE "patient_sessions" ADD COLUMN "guest_token" text; 