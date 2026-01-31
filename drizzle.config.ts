import { resolve } from 'node:path';

import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load environment variables from .env.local first, then .env
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export default defineConfig({
  schema: './database/schema/*',
  out: './database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    table: '__drizzle_migrations',
    schema: 'public',
  },
  // Configure which tables Drizzle Kit should manage
  // - '!acc_*': Exclude all tables starting with 'acc_' (ACC injury data tables)
  // - '!transcription_chunks': Manually managed table (Drizzle will warn about sequence, always abort)
  // - '!paediatric_medications': Manually created table to ignore
  // - Manages all other tables defined in schema files
  // 
  // KNOWN ISSUE: Drizzle may prompt to drop transcription_chunks_id_seq1 (IDENTITY internal sequence)
  // This is a Drizzle limitation - tablesFilter doesn't apply to sequences.
  // ALWAYS SELECT "No, abort" when prompted. The sequence is required by the table.
  // Use direct SQL for schema changes if needed (see: add-grace-column.mjs example)
  tablesFilter: ['!acc_*', '!transcription_chunks', '!paediatric_medications'],
  verbose: true,
  strict: true,
});
