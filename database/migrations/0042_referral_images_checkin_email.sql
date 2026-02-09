-- Referral Images: Day 3 check-in email tracking
-- Email 2: Check-in email sent 3 days after signup (all users)

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "check_in_email_sent_at" timestamp;
