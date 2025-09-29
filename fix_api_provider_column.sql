-- Add api_provider column if it doesn't exist
ALTER TABLE api_usage_costs ADD COLUMN IF NOT EXISTS api_provider text NOT NULL DEFAULT 'unknown';

-- Update the column to be NOT NULL without default for future inserts
ALTER TABLE api_usage_costs ALTER COLUMN api_provider DROP DEFAULT;
