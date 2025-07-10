ALTER TABLE "templates" ALTER COLUMN "sections" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "description" text;