CREATE TABLE "email_captures" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"practice_name" text,
	"practice_size" text,
	"biggest_challenge" text,
	"source" text DEFAULT 'landing_page',
	"created_at" timestamp DEFAULT now() NOT NULL
);
