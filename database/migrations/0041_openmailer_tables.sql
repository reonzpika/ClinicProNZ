-- OpenMailer tables (prefixed to avoid conflicts with ClinicPro)
-- Run this file directly in Neon SQL Editor or: psql "$DATABASE_URL" -f database/migrations/0041_openmailer_tables.sql

CREATE TABLE IF NOT EXISTS "openmailer_subscribers" (
  "id" text PRIMARY KEY,
  "email" text NOT NULL UNIQUE,
  "name" text,
  "list_name" text NOT NULL DEFAULT 'general',
  "status" text NOT NULL DEFAULT 'active',
  "source" text,
  "metadata" jsonb,
  "subscribed_at" timestamp with time zone NOT NULL DEFAULT now(),
  "unsubscribed_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "openmailer_subscribers_email_idx" ON "openmailer_subscribers" ("email");
CREATE INDEX IF NOT EXISTS "openmailer_subscribers_list_name_idx" ON "openmailer_subscribers" ("list_name");
CREATE INDEX IF NOT EXISTS "openmailer_subscribers_status_idx" ON "openmailer_subscribers" ("status");

CREATE TABLE IF NOT EXISTS "openmailer_campaigns" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "subject" text NOT NULL,
  "body_html" text NOT NULL,
  "body_text" text,
  "from_name" text NOT NULL DEFAULT 'Dr. Ryo Eguchi',
  "from_email" text NOT NULL DEFAULT 'ryo@clinicpro.co.nz',
  "reply_to" text,
  "list_name" text NOT NULL,
  "status" text NOT NULL DEFAULT 'draft',
  "scheduled_at" timestamp with time zone,
  "sent_at" timestamp with time zone,
  "total_recipients" integer NOT NULL DEFAULT 0,
  "total_sent" integer NOT NULL DEFAULT 0,
  "total_opens" integer NOT NULL DEFAULT 0,
  "total_clicks" integer NOT NULL DEFAULT 0,
  "total_bounces" integer NOT NULL DEFAULT 0,
  "total_unsubscribes" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "openmailer_campaigns_list_name_idx" ON "openmailer_campaigns" ("list_name");
CREATE INDEX IF NOT EXISTS "openmailer_campaigns_status_idx" ON "openmailer_campaigns" ("status");

CREATE TABLE IF NOT EXISTS "openmailer_emails" (
  "id" text PRIMARY KEY,
  "campaign_id" text NOT NULL REFERENCES "openmailer_campaigns"("id") ON DELETE CASCADE,
  "subscriber_id" text NOT NULL REFERENCES "openmailer_subscribers"("id") ON DELETE CASCADE,
  "message_id" text,
  "status" text NOT NULL DEFAULT 'pending',
  "opened_at" timestamp with time zone,
  "clicked_at" timestamp with time zone,
  "bounced_at" timestamp with time zone,
  "unsubscribed_at" timestamp with time zone,
  "sent_at" timestamp with time zone,
  "error_message" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "openmailer_emails_campaign_subscriber_idx" ON "openmailer_emails" ("campaign_id", "subscriber_id");
CREATE INDEX IF NOT EXISTS "openmailer_emails_campaign_id_idx" ON "openmailer_emails" ("campaign_id");
CREATE INDEX IF NOT EXISTS "openmailer_emails_subscriber_id_idx" ON "openmailer_emails" ("subscriber_id");
CREATE INDEX IF NOT EXISTS "openmailer_emails_message_id_idx" ON "openmailer_emails" ("message_id");

CREATE TABLE IF NOT EXISTS "openmailer_links" (
  "id" text PRIMARY KEY,
  "campaign_id" text NOT NULL REFERENCES "openmailer_campaigns"("id") ON DELETE CASCADE,
  "url" text NOT NULL,
  "short_code" text NOT NULL UNIQUE,
  "click_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "openmailer_links_campaign_id_idx" ON "openmailer_links" ("campaign_id");
CREATE INDEX IF NOT EXISTS "openmailer_links_short_code_idx" ON "openmailer_links" ("short_code");

CREATE TABLE IF NOT EXISTS "openmailer_clicks" (
  "id" text PRIMARY KEY,
  "email_id" text NOT NULL REFERENCES "openmailer_emails"("id") ON DELETE CASCADE,
  "link_id" text NOT NULL REFERENCES "openmailer_links"("id") ON DELETE CASCADE,
  "ip_address" text,
  "user_agent" text,
  "clicked_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "openmailer_clicks_email_id_idx" ON "openmailer_clicks" ("email_id");
CREATE INDEX IF NOT EXISTS "openmailer_clicks_link_id_idx" ON "openmailer_clicks" ("link_id");
CREATE INDEX IF NOT EXISTS "openmailer_clicks_clicked_at_idx" ON "openmailer_clicks" ("clicked_at");
