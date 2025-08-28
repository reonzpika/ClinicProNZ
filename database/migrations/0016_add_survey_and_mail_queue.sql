-- Create survey_responses table
CREATE TABLE IF NOT EXISTS "survey_responses" (
  "id" text PRIMARY KEY,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "email" text NOT NULL,
  "q1" jsonb NOT NULL,
  "q2" text NOT NULL,
  "q3" jsonb NOT NULL,
  "q4" jsonb NOT NULL,
  "q5" integer NOT NULL,
  "q5_price_band" text,
  "opted_in" boolean NOT NULL,
  "call_opt_in" boolean NOT NULL DEFAULT false,
  "gold_lead" boolean NOT NULL DEFAULT false,
  "priority_weight" integer NOT NULL,
  "urgency_score" integer NOT NULL,
  "raw_payload" jsonb NOT NULL,
  "ip_address" text,
  "tags" text[]
);

CREATE INDEX IF NOT EXISTS "idx_survey_email" ON "survey_responses" ("email");
CREATE INDEX IF NOT EXISTS "idx_survey_created_at" ON "survey_responses" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_survey_gold_lead" ON "survey_responses" ("gold_lead");

-- Create mail_queue table and enum
DO $$ BEGIN
  CREATE TYPE mail_status AS ENUM ('queued', 'sent', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "mail_queue" (
  "id" text PRIMARY KEY,
  "to_email" text NOT NULL,
  "subject" text NOT NULL,
  "html_body" text NOT NULL,
  "text_body" text NOT NULL,
  "status" mail_status NOT NULL DEFAULT 'queued',
  "error" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "sent_at" timestamp with time zone
);

