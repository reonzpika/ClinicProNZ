-- Share events and referrals for GP Referral Images

-- Users: referral and share reminder columns
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referral_code" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referred_by" text REFERENCES "users"("id");
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "share_reminder_sent" boolean NOT NULL DEFAULT false;

-- Partial unique index: only non-null referral_codes must be unique (multiple NULLs allowed)
CREATE UNIQUE INDEX IF NOT EXISTS "users_referral_code_unique" ON "users" ("referral_code") WHERE "referral_code" IS NOT NULL;

-- Share events table
CREATE TABLE IF NOT EXISTS "share_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "location" text NOT NULL,
  "method" text,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "share_events_user_created_idx"
  ON "share_events" ("user_id", "created_at");

-- Referrals table
CREATE TABLE IF NOT EXISTS "referrals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "referrer_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "referee_id" text REFERENCES "users"("id") ON DELETE SET NULL,
  "referral_code" text NOT NULL,
  "signup_completed" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "signup_at" timestamp
);

CREATE INDEX IF NOT EXISTS "referrals_referrer_idx" ON "referrals" ("referrer_id");
CREATE INDEX IF NOT EXISTS "referrals_code_idx" ON "referrals" ("referral_code");
