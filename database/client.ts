import { resolve } from 'node:path';

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema';

// Load environment variables from .env.local first, then .env
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

// Initialize database client lazily-safe for build time (no throw on import)
export const sql = databaseUrl ? neon(databaseUrl) : (null as unknown as ReturnType<typeof neon>);
export const db = databaseUrl
  ? drizzle(sql, { schema })
  : ({} as unknown as ReturnType<typeof drizzle<typeof schema>>);

// Export schema for use in other files
export { schema };
