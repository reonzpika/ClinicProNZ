import path from 'node:path';

import { migrate } from 'drizzle-orm/neon-http/migrator';

import { db } from './db';

// Simple logger to replace console statements
const logger = {
  info: (message: string) => {
    // In production, this could be replaced with a proper logging service
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(message);
    }
  },
  error: (message: string, error?: unknown) => {
    // In production, this could be replaced with a proper logging service
    if (process.env.NODE_ENV !== 'production') {
      console.error(message, error);
    }
  },
};

export async function runMigrations() {
  try {
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), 'migrations'),
    });
    logger.info('Migrations completed successfully');
  } catch (err) {
    logger.error('Migration failed:', err);
    throw err;
  }
}
