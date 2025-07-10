CREATE TYPE "public"."feature_status" AS ENUM('planned', 'in_progress', 'completed');--> statement-breakpoint
CREATE TABLE "feature_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"idea" varchar(256) NOT NULL,
	"details" varchar(1024),
	"email" varchar(128),
	"ip_address" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "features" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(128) NOT NULL,
	"description" varchar(512) NOT NULL,
	"status" "feature_status" NOT NULL,
	"vote_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recording_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "recording_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"feature_id" integer NOT NULL,
	"ip_address" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "dsl" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_feature_id_features_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."features"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" DROP COLUMN "sections";--> statement-breakpoint
ALTER TABLE "templates" DROP COLUMN "prompts";