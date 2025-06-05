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
      "components": {
        "differentialDiagnosis": false,
        "assessmentSummary": false,
        "managementPlan": false,
        "redFlags": false
      },
      "level": "medium"
    },
    "abbreviations": false
  }'::jsonb
)
WHERE dsl IS NOT NULL 
  AND (dsl->'settings') IS NULL;

COMMIT; 