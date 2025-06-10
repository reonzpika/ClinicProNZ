BEGIN;

-- Update existing templates to include default settings in their DSL
UPDATE templates 
SET dsl = jsonb_set(
  dsl,
  '{settings}',
  '{
    "bulletPoints": false,
    "aiAnalysis": {
      "enabled": false,
      "components": {
        "differentialDiagnosis": false,
        "assessmentSummary": false,
        "managementPlan": false
      },
      "level": "medium"
    }
  }'::jsonb
)
WHERE dsl IS NOT NULL 
  AND (dsl->'settings') IS NULL;

COMMIT; 