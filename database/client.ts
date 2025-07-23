import { resolve } from 'node:path';

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema';

// Load environment variables from .env.local first, then .env
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL');
}

// Initialize database client
export const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

// Export schema for use in other files
export { schema };
