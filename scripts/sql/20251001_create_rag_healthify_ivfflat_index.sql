-- Enable pgvector if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Partial ANN index for Healthify-only rows
CREATE INDEX CONCURRENTLY IF NOT EXISTS rag_healthify_ivfflat
  ON rag_documents
  USING ivfflat (embedding vector_cosine_ops)
  WHERE source_type = 'healthify'
  WITH (lists = 100);

-- Refresh planner stats
ANALYZE rag_documents;
