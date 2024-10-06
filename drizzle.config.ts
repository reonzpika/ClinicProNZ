import type { Config } from 'drizzle-kit';

export default {
  schema: './src/models/Schema.ts',
  out: './migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL!,
  },
} satisfies Config;
