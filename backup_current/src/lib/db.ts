import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import { env } from '@/lib/env';
import * as schema from '@/models/Schema';

// Only initialize the database connection on the server side
const initializeDb = () => {
  if (typeof window === 'undefined') {
    if (!env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    const sql = neon(env.DATABASE_URL);
    return drizzle(sql, { schema });
  } else {
    // Provide a dummy implementation for client-side that throws a helpful error
    const clientSideError = () => {
      throw new Error('Database methods cannot be called on the client side');
    };

    return new Proxy({} as ReturnType<typeof drizzle>, {
      get: () => clientSideError,
    });
  }
};

const db = initializeDb();

export { db };
