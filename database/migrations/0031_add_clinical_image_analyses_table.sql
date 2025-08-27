-- Add clinical_image_analyses table for storing AI analysis results of clinical images

CREATE TABLE "clinical_image_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image_key" text NOT NULL,
	"user_id" text NOT NULL,
	"session_id" uuid,
	"prompt" text,
	"result" text NOT NULL,
	"model_used" text,
	"analyzed_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE "clinical_image_analyses" ADD CONSTRAINT "clinical_image_analyses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "clinical_image_analyses" ADD CONSTRAINT "clinical_image_analyses_session_id_patient_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "patient_sessions"("id") ON DELETE cascade ON UPDATE no action;

-- Add indexes for better query performance
CREATE INDEX "clinical_image_analyses_user_id_idx" ON "clinical_image_analyses" ("user_id");
CREATE INDEX "clinical_image_analyses_image_key_idx" ON "clinical_image_analyses" ("image_key");
CREATE INDEX "clinical_image_analyses_session_id_idx" ON "clinical_image_analyses" ("session_id");
CREATE INDEX "clinical_image_analyses_analyzed_at_idx" ON "clinical_image_analyses" ("analyzed_at");

-- Add unique constraint to prevent duplicate analyses for the same image/prompt combination
CREATE UNIQUE INDEX "clinical_image_analyses_image_key_prompt_unique" ON "clinical_image_analyses" ("image_key", "prompt") WHERE "prompt" IS NOT NULL;
CREATE UNIQUE INDEX "clinical_image_analyses_image_key_no_prompt_unique" ON "clinical_image_analyses" ("image_key") WHERE "prompt" IS NULL;
