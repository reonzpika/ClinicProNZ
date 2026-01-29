-- Add GP Referral Images fields to existing tables

-- Add Stripe payment tracking to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_payment_id" varchar(500);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "upgraded_at" timestamp;

-- Add grace unlocks tracking to image_tool_usage
ALTER TABLE "image_tool_usage" ADD COLUMN IF NOT EXISTS "grace_unlocks_used" integer NOT NULL DEFAULT 0;

-- Add metadata fields to image_tool_uploads
ALTER TABLE "image_tool_uploads" ADD COLUMN IF NOT EXISTS "side" text;
ALTER TABLE "image_tool_uploads" ADD COLUMN IF NOT EXISTS "description" text;
