CREATE TYPE "public"."mail_status" AS ENUM('queued', 'sent', 'failed');--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "mail_queue" (
	"id" text PRIMARY KEY NOT NULL,
	"to_email" text NOT NULL,
	"subject" text NOT NULL,
	"html_body" text NOT NULL,
	"text_body" text NOT NULL,
	"status" "mail_status" DEFAULT 'queued' NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "survey_responses" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email" text,
	"q1" jsonb NOT NULL,
	"q3" jsonb NOT NULL,
	"q4" jsonb NOT NULL,
	"q5" integer NOT NULL,
	"q5_price_band" text,
	"call_opt_in" boolean DEFAULT false NOT NULL,
	"gold_lead" boolean DEFAULT false NOT NULL,
	"raw_payload" jsonb NOT NULL,
	"ip_address" text
);
--> statement-breakpoint
ALTER TABLE "mobile_tokens" ADD COLUMN "is_permanent" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "patient_sessions" ADD COLUMN "is_recording" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "rag_documents" ADD COLUMN "sections" jsonb;--> statement-breakpoint
ALTER TABLE "rag_documents" ADD COLUMN "overall_summary" text;--> statement-breakpoint
ALTER TABLE "rag_documents" ADD COLUMN "section_summaries" jsonb;--> statement-breakpoint
ALTER TABLE "rag_documents" ADD COLUMN "author" text;--> statement-breakpoint
ALTER TABLE "rag_documents" ADD COLUMN "last_updated" timestamp;--> statement-breakpoint
ALTER TABLE "rag_documents" ADD COLUMN "categories" jsonb;--> statement-breakpoint
ALTER TABLE "rag_documents" ADD COLUMN "content_type" text;--> statement-breakpoint
ALTER TABLE "rag_documents" ADD COLUMN "medical_specialty" text;--> statement-breakpoint
ALTER TABLE "rag_documents" ADD COLUMN "target_audience" text;--> statement-breakpoint
ALTER TABLE "rag_documents" ADD COLUMN "internal_links" jsonb;--> statement-breakpoint
ALTER TABLE "rag_documents" ADD COLUMN "external_citations" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "current_session_id" text;--> statement-breakpoint
ALTER TABLE "clinical_image_analyses" ADD CONSTRAINT "clinical_image_analyses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_image_analyses" ADD CONSTRAINT "clinical_image_analyses_session_id_patient_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."patient_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mobile_tokens" DROP COLUMN "expires_at";--> statement-breakpoint
ALTER TABLE "patient_sessions" DROP COLUMN "is_temporary";