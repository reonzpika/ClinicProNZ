import { resolve } from 'node:path';

import { config } from 'dotenv';
import type { Config } from 'drizzle-kit';

config({ path: resolve('.env.local') });

export default {
  schema: './src/models/Schema.ts',
  out: './migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
