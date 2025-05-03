import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Initialize database client
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function executeSqlFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Split on semicolons and statement breakpoints
  const statements = content
    .split(/(?:;|--> statement-breakpoint)/)
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);
  
  for (const statement of statements) {
    try {
      console.log('Executing:', statement);
      await sql.query(statement);
    } catch (error) {
      console.error('Error executing statement:', statement);
      throw error;
    }
  }
}

async function main() {
  try {
    // First execute SQL files in order
    const sqlFiles = ['0000_green_natasha_romanoff.sql', '0001_update_id_types.sql']
      .map(file => path.join(__dirname, 'migrations', file));
    
    for (const file of sqlFiles) {
      console.log(`Executing SQL file: ${file}`);
      await executeSqlFile(file);
    }

    // Then run TypeScript migrations
    const tsFiles = ['0002_add_default_templates.ts']
      .map(file => path.join(__dirname, 'migrations', file));
    
    for (const file of tsFiles) {
      console.log(`Executing TypeScript migration: ${file}`);
      const migration = require(file);
      if (typeof migration.up === 'function') {
        await migration.up(db);
      }
    }

    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
