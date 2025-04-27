import { drizzle } from 'drizzle-orm/neon-http';
import { neon, Pool } from '@neondatabase/serverless';
import { pino } from 'pino';
import { retry } from 'ts-retry-promise';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

// Initialize logger
const logger = pino({
  name: 'database-client',
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: true,
    },
  },
});

// Connection pool configuration
const POOL_CONFIG = {
  max: 20, // Maximum number of connections in the pool
  min: 2,  // Minimum number of connections in the pool
  idleTimeoutMillis: 30000, // How long a connection can be idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection from the pool
};

// Retry configuration
const RETRY_CONFIG = {
  retries: 3,
  delay: 1000,
  backoff: 'LINEAR' as const,
  logger: (msg: string) => logger.debug(msg),
};

if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL');
}

// Create connection pool with retry mechanism
const createPool = async () => {
  return retry(
    async () => {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL!,
        ...POOL_CONFIG,
      });

      // Test the connection
      const client = await pool.connect();
      try {
        await client.query('SELECT 1');
        logger.info('Database connection pool established');
      } finally {
        client.release();
      }

      return pool;
    },
    RETRY_CONFIG
  ).catch((error: Error) => {
    logger.error('Failed to establish database connection pool after retries', error);
    throw error;
  });
};

// Initialize database client with connection pool
const pool = await createPool();
export const db = drizzle(pool, {
  logger: {
    logQuery: (query, params) => {
      logger.debug({ query, params }, 'Executing database query');
    },
  },
});

// Custom error class for database operations
export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Helper functions for database operations with enhanced error handling
export const executeQuery = async <T>(query: string, params?: any[]): Promise<T[]> => {
  try {
    const result = await retry(
      async () => {
        const data = await pool.query(query, params);
        return data.rows as unknown as T[];
      },
      RETRY_CONFIG
    );
    return result;
  } catch (error) {
    logger.error({ query, params, error }, 'Database query error');
    throw new DatabaseError(
      'Failed to execute database query',
      'QUERY_ERROR',
      error instanceof Error ? error : undefined
    );
  }
};

// Transaction helper with enhanced error handling
export const withTransaction = async <T>(callback: (tx: NeonHttpDatabase) => Promise<T>): Promise<T> => {
  const client = await pool.connect();
  try {
    return await db.transaction(async (tx) => {
      try {
        return await callback(tx);
      } catch (error) {
        logger.error({ error }, 'Transaction error');
        throw new DatabaseError(
          'Transaction failed',
          'TRANSACTION_ERROR',
          error instanceof Error ? error : undefined
        );
      }
    });
  } finally {
    client.release();
  }
};

// Health check function
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error({ error }, 'Database health check failed');
    return false;
  }
};

// Graceful shutdown
export const closePool = async (): Promise<void> => {
  try {
    await pool.end();
    logger.info('Database connection pool closed');
  } catch (error) {
    logger.error({ error }, 'Error closing database connection pool');
    throw error;
  }
}; 