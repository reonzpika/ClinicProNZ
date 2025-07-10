-- Make userId nullable in mobile_tokens table to support anonymous guest tokens
ALTER TABLE "mobile_tokens" ALTER COLUMN "user_id" DROP NOT NULL; 