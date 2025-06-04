BEGIN;

-- Update existing templates to include default settings in their DSL
UPDATE templates 
SET dsl = jsonb_set(
  dsl,
  '{settings}',
  '{
    "detailLevel": "medium",
    "bulletPoints": false,
    "aiAnalysis": {
      "enabled": false,
      "level": "standard"
    },
    "abbreviations": false
  }'::jsonb
)
WHERE dsl IS NOT NULL 
  AND (dsl->'settings') IS NULL;

COMMIT; 