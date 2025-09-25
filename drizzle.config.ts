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
  // - 'patient_sessions': Include this table for schema management
  // - '!acc_*': Exclude all tables starting with 'acc_' (ACC injury data tables)
  // To modify: Add table names to include, or '!pattern' to exclude
  tablesFilter: ['patient_sessions', '!acc_*'],
  verbose: true,
  strict: true,
});
