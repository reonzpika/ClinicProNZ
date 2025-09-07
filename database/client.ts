import { resolve } from 'node:path';

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema';

// Load environment variables from .env.local first, then .env
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config();

// Lazy-initialised database client to avoid build-time env access
let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL');
  }

  if (!dbInstance) {
    const sql = neon(databaseUrl);
    dbInstance = drizzle(sql, { schema });
  }

  return dbInstance;
}

// Export schema for use in other files
export { schema };
