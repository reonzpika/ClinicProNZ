#!/usr/bin/env tsx

import { sql } from 'drizzle-orm';
import { getDb } from '../database/client';

async function main(): Promise<void> {
  const db = getDb();

  console.log('[MIGRATE] Adding chunk_index column (if missing)');
  await db.execute(sql`ALTER TABLE rag_documents ADD COLUMN IF NOT EXISTS chunk_index integer NOT NULL DEFAULT 0`);

  console.log('[MIGRATE] Dropping old unique on source (if exists)');
  // Try common names for drizzle-generated unique constraints/indexes
  await db.execute(sql`DO $$ BEGIN
    IF EXISTS (
      SELECT 1 FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      WHERE t.relname = 'rag_documents' AND c.conname = 'rag_documents_source_unique'
    ) THEN
      ALTER TABLE rag_documents DROP CONSTRAINT rag_documents_source_unique;
    END IF;
  END $$;`);

  await db.execute(sql`DROP INDEX IF EXISTS rag_documents_source_unique;`);
  await db.execute(sql`DROP INDEX IF EXISTS rag_documents_source_unique_idx;`);

  console.log('[MIGRATE] Creating unique index on (source, chunk_index)');
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS rag_documents_source_chunk_unique ON rag_documents (source, chunk_index)`);

  console.log('[MIGRATE] Creating index on source');
  await db.execute(sql`CREATE INDEX IF NOT EXISTS rag_documents_source_idx ON rag_documents (source)`);

  console.log('[MIGRATE] Done');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[MIGRATE] Fatal error:', err);
    process.exit(1);
  });
}

