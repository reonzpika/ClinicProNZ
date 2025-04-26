import { sql } from 'drizzle-orm';

export async function up(_db: any) {
  await sql`
    -- Add new columns to template table
    ALTER TABLE template
    ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'multi-problem',
    ADD COLUMN content TEXT NOT NULL DEFAULT '',
    ADD COLUMN structure JSONB NOT NULL DEFAULT '{"sections": []}',
    ADD COLUMN is_system BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN parent_id INTEGER REFERENCES template(id);

    -- Convert existing name and user_id columns
    ALTER TABLE template
    ALTER COLUMN name TYPE VARCHAR(255),
    ALTER COLUMN user_id TYPE VARCHAR(255);

    -- Create indices for common queries
    CREATE INDEX idx_template_user_id ON template(user_id);
    CREATE INDEX idx_template_type ON template(type);
    CREATE INDEX idx_template_is_latest ON template(is_latest);
    CREATE INDEX idx_template_is_system ON template(is_system);

    -- Convert template_sections table
    ALTER TABLE template_section
    ALTER COLUMN title TYPE VARCHAR(255);
  `;
}

export async function down(_db: any) {
  await sql`
    -- Remove indices
    DROP INDEX IF EXISTS idx_template_user_id;
    DROP INDEX IF EXISTS idx_template_type;
    DROP INDEX IF EXISTS idx_template_is_latest;
    DROP INDEX IF EXISTS idx_template_is_system;

    -- Remove new columns from template table
    ALTER TABLE template
    DROP COLUMN IF EXISTS type,
    DROP COLUMN IF EXISTS content,
    DROP COLUMN IF EXISTS structure,
    DROP COLUMN IF EXISTS is_system,
    DROP COLUMN IF EXISTS is_active,
    DROP COLUMN IF EXISTS parent_id;

    -- Revert column type changes
    ALTER TABLE template
    ALTER COLUMN name TYPE TEXT,
    ALTER COLUMN user_id TYPE TEXT;

    -- Revert template_sections table changes
    ALTER TABLE template_section
    ALTER COLUMN title TYPE TEXT;
  `;
}
