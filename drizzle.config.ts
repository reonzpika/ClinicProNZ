import type { Config } from 'drizzle-kit';

const config: Config = {
  schema: './src/models/Schema.ts',
  out: './migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL!,
  },
};

export default config;
