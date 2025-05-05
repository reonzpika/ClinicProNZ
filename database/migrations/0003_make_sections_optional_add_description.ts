import { sql } from 'drizzle-orm';
import { pgTable, text } from 'drizzle-orm/pg-core';

export async function up(db: any) {
  // Add description column
  await db.execute(sql`
    ALTER TABLE templates
    ADD COLUMN description text;
  `);

  // Make sections nullable
  await db.execute(sql`
    ALTER TABLE templates
    ALTER COLUMN sections DROP NOT NULL;
  `);
}

export async function down(db: any) {
  // Remove description column
  await db.execute(sql`
    ALTER TABLE templates
    DROP COLUMN description;
  `);

  // Make sections required again
  await db.execute(sql`
    ALTER TABLE templates
    ALTER COLUMN sections SET NOT NULL;
  `);
} 