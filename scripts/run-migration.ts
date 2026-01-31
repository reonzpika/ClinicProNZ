#!/usr/bin/env tsx
/**
 * Run a single SQL migration file against the database.
 * Usage: pnpm tsx scripts/run-migration.ts <migration-name>
 * Example: pnpm tsx scripts/run-migration.ts 0038_share_referral_tracking.sql
 *
 * Loads .env.local and .env for DATABASE_URL.
 * File is resolved from database/migrations/<name> (add .sql if omitted).
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import * as dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config();

function parseStatements(content: string): string[] {
  return content
    .split(/;\s*\n/)
    .map((chunk) =>
      chunk
        .split('\n')
        .filter((line) => !line.trim().startsWith('--'))
        .join('\n')
        .trim(),
    )
    .filter((s) => s.length > 0);
}

async function main() {
  const name = process.argv[2];
  if (!name) {
    console.error('Usage: pnpm tsx scripts/run-migration.ts <migration-name>');
    console.error('Example: pnpm tsx scripts/run-migration.ts 0038_share_referral_tracking.sql');
    process.exit(1);
  }

  const fileName = name.endsWith('.sql') ? name : `${name}.sql`;
  const filePath = resolve(process.cwd(), 'database', 'migrations', fileName);

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set (check .env or .env.local)');
    process.exit(1);
  }

  let sql: string;
  try {
    sql = readFileSync(filePath, 'utf-8');
  } catch {
    console.error(`Migration file not found: ${filePath}`);
    process.exit(1);
  }

  const statements = parseStatements(sql);
  if (statements.length === 0) {
    console.error('No statements found in migration file.');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    console.log(`Running ${statements.length} statement(s) from ${fileName}...`);
    for (let i = 0; i < statements.length; i++) {
      await client.query(statements[i]!);
      console.log(`  [${i + 1}/${statements.length}] OK`);
    }
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
