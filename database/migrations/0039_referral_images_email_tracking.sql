-- Referral Images email sequence tracking
-- Supports: Email 4 (limit hit), Email 5 (share encourage), Email 6 (month reset)

-- Add email tracking to image_tool_usage (per user per month)
ALTER TABLE "image_tool_usage" ADD COLUMN IF NOT EXISTS "limit_hit_email_sent_at" timestamp;
ALTER TABLE "image_tool_usage" ADD COLUMN IF NOT EXISTS "share_encourage_email_sent_at" timestamp;

-- Add month reset email tracking to users (per user, YYYY-MM)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_month_reset_email_for" text;
