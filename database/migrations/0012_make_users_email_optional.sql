-- Make email field optional in users table for improved webhook reliability
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL; 