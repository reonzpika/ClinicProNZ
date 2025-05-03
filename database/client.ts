import { neon } from '@neondatabase/serverless';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { drizzle } from 'drizzle-orm/neon-http';
import { retry } from 'ts-retry-promise';

if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL');
}

// Initialize database client
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql);

// Custom error class for database operations
export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: Error,
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
        const data = await sql.query(query, params);
        return data.rows as unknown as T[];
      },
      {
        retries: 3,
        delay: 1000,
        backoff: 'LINEAR' as const,
      },
    );
    return result;
  } catch (error) {
    console.error('Database query error:', { query, params, error });
    throw new DatabaseError(
      'Failed to execute database query',
      'QUERY_ERROR',
      error instanceof Error ? error : undefined,
    );
  }
};

// Transaction helper with enhanced error handling
export const withTransaction = async <T>(callback: (tx: NeonHttpDatabase) => Promise<T>): Promise<T> => {
  return db.transaction(async (tx) => {
    try {
      return await callback(tx);
    } catch (error) {
      console.error('Transaction error:', error);
      throw new DatabaseError(
        'Transaction failed',
        'TRANSACTION_ERROR',
        error instanceof Error ? error : undefined,
      );
    }
  });
};

// Health check function
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await sql.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

// Graceful shutdown
export const closePool = async (): Promise<void> => {
  try {
    await sql.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
};
