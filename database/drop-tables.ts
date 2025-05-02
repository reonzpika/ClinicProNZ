import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const sql = neon(process.env.DATABASE_URL);

async function dropTables() {
  try {
    // Drop all tables in the correct order (respecting foreign key constraints)
    await sql`DROP TABLE IF EXISTS templates CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    
    console.log('Tables dropped successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to drop tables:', error);
    process.exit(1);
  }
}

dropTables(); 