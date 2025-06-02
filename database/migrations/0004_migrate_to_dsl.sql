BEGIN;

-- 1. Add new DSL column if it doesn't exist
ALTER TABLE templates
  ADD COLUMN IF NOT EXISTS dsl JSONB;

-- 2. Update existing records to have a default DSL structure
UPDATE templates 
SET dsl = '{"sections": [{"heading": "Default Section", "prompt": "Default prompt"}]}'
WHERE dsl IS NULL;

-- 3. Make dsl column NOT NULL
ALTER TABLE templates
  ALTER COLUMN dsl SET NOT NULL;

-- 4. Drop legacy columns if they exist
ALTER TABLE templates
  DROP COLUMN IF EXISTS prompts;

ALTER TABLE templates
  DROP COLUMN IF EXISTS sections;

-- 5. Add description column if it doesn't exist
ALTER TABLE templates
  ADD COLUMN IF NOT EXISTS description text;

COMMIT; 