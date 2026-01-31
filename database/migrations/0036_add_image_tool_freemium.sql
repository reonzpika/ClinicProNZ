-- Standalone ClinicPro Photo Tool (Freemium)

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "image_tier" text NOT NULL DEFAULT 'free';

CREATE TABLE IF NOT EXISTS "image_tool_mobile_links" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token" text NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "last_used_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "image_tool_mobile_links_token_unique"
  ON "image_tool_mobile_links" ("token");

CREATE TABLE IF NOT EXISTS "image_tool_usage" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "month" text NOT NULL,
  "image_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "image_tool_usage_user_month_unique"
  ON "image_tool_usage" ("user_id", "month");

CREATE INDEX IF NOT EXISTS "image_tool_usage_user_idx"
  ON "image_tool_usage" ("user_id");

CREATE TABLE IF NOT EXISTS "image_tool_uploads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "image_id" text NOT NULL,
  "s3_key" text NOT NULL,
  "file_size" integer,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "expires_at" timestamp NOT NULL
);

CREATE INDEX IF NOT EXISTS "image_tool_uploads_user_created_idx"
  ON "image_tool_uploads" ("user_id", "created_at");

CREATE INDEX IF NOT EXISTS "image_tool_uploads_expires_idx"
  ON "image_tool_uploads" ("expires_at");

