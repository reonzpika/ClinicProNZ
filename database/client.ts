import { resolve } from 'node:path';

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema';

// Load environment variables from .env.local first, then .env
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config();

// Initialize database client lazily; avoid throwing during import-time (e.g., Next build)
// Keep `sql` callable for type-checkers by providing a throwing function when unset.
let db: ReturnType<typeof drizzle> | any;
const sql: any = process.env.DATABASE_URL
  ? neon(process.env.DATABASE_URL)
  : ((..._args: any[]) => {
      throw new Error('DATABASE_URL not set. Database access attempted during build/runtime without configuration.');
    });

if (process.env.DATABASE_URL) {
  db = drizzle(sql, { schema });
} else {
  // Safe proxy: throws only if DB is actually used without env configured
  db = new Proxy({}, {
    get() {
      throw new Error('DATABASE_URL not set. Database access attempted during build/runtime without configuration.');
    },
  });
}

export { sql, db };

// Export schema for use in other files
export { schema };
