-- Enable trigram extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram indexes to speed up similarity/ILIKE queries on occupation codes
CREATE INDEX IF NOT EXISTS acc_occ_title_trgm
  ON public.acc_occupation_codes USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS acc_occ_code_trgm
  ON public.acc_occupation_codes USING GIN (code gin_trgm_ops);
