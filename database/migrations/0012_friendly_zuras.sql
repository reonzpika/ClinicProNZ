ALTER TABLE "feature_requests" ADD COLUMN "status" text DEFAULT 'unread';--> statement-breakpoint
ALTER TABLE "survey_responses" ADD COLUMN "status" text DEFAULT 'unread';