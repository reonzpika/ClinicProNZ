CREATE TABLE "api_usage_costs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"session_id" uuid,
	"api_provider" text NOT NULL,
	"api_function" text NOT NULL,
	"usage_metrics" jsonb NOT NULL,
	"cost_usd" numeric(10, 6) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact_messages" ALTER COLUMN "status" SET DEFAULT 'unread';--> statement-breakpoint
ALTER TABLE "patient_sessions" ADD COLUMN "problems_text" text;--> statement-breakpoint
ALTER TABLE "patient_sessions" ADD COLUMN "objective_text" text;--> statement-breakpoint
ALTER TABLE "patient_sessions" ADD COLUMN "assessment_text" text;--> statement-breakpoint
ALTER TABLE "patient_sessions" ADD COLUMN "plan_text" text;--> statement-breakpoint
ALTER TABLE "patient_sessions" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "patient_sessions" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "rag_documents" ADD COLUMN "enhancement_status" text DEFAULT 'basic' NOT NULL;--> statement-breakpoint
ALTER TABLE "rag_documents" ADD COLUMN "basic_content" text;--> statement-breakpoint
ALTER TABLE "rag_documents" ADD COLUMN "last_enhanced" timestamp;--> statement-breakpoint
ALTER TABLE "api_usage_costs" ADD CONSTRAINT "api_usage_costs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_usage_costs" ADD CONSTRAINT "api_usage_costs_session_id_patient_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."patient_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rag_documents" ADD CONSTRAINT "rag_documents_source_unique" UNIQUE("source");