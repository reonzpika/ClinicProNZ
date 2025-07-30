CREATE TABLE "contact_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"user_tier" text,
	"user_id" text,
	"source" text DEFAULT 'contact_page',
	"status" text DEFAULT 'new',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "patient_sessions" ADD COLUMN "is_temporary" boolean DEFAULT false NOT NULL;