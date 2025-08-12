-- Fix incorrect data type for mobile_tokens.is_permanent (should be boolean)
ALTER TABLE "mobile_tokens" ALTER COLUMN "is_permanent" DROP DEFAULT;
-- Force-convert existing values to TRUE (permanent tokens design)
ALTER TABLE "mobile_tokens" ALTER COLUMN "is_permanent" TYPE boolean USING true;
ALTER TABLE "mobile_tokens" ALTER COLUMN "is_permanent" SET DEFAULT true;
UPDATE "mobile_tokens" SET "is_permanent" = true WHERE "is_permanent" IS DISTINCT FROM true;
ALTER TABLE "mobile_tokens" ALTER COLUMN "is_permanent" SET NOT NULL;


