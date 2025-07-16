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
  verbose: true,
  strict: true,
});
