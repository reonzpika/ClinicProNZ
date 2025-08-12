-- Robust fix: if is_permanent exists with non-boolean type, recreate as boolean
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'mobile_tokens' AND column_name = 'is_permanent' AND data_type <> 'boolean'
  ) THEN
    ALTER TABLE "mobile_tokens" RENAME COLUMN "is_permanent" TO "is_permanent_tmp";
    ALTER TABLE "mobile_tokens" ADD COLUMN "is_permanent" boolean DEFAULT true NOT NULL;
    UPDATE "mobile_tokens" SET "is_permanent" = true;
    ALTER TABLE "mobile_tokens" DROP COLUMN "is_permanent_tmp";
  END IF;
END$$;


