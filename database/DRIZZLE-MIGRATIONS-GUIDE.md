# Drizzle Kit: Migration Guide and Known Issues

**For AI agents and developers:** Read this before suggesting or running `drizzle-kit migrate`, `drizzle-kit push`, or `db:push`. This project has recurring issues with these commands.

---

## TL;DR

**Do not suggest `drizzle-kit migrate` or `drizzle-kit push` for schema changes.**

Instead: create a migration SQL file in `database/migrations/`, update the schema in `database/schema/`, then run the SQL file directly (Neon dashboard, psql, or a one-off script).

---

## Known Issues

### 1. `drizzle-kit migrate` – "relation already exists"

**Error:** `error: relation "templates" already exists` (or similar)

**Cause:** `drizzle-kit migrate` replays **all** migrations in order. If the database was set up before the Drizzle migration journal was in sync (e.g. tables created manually or via an older workflow), migrate tries to re-run early migrations that CREATE TABLE. Those tables already exist, so the command fails.

**Fix:** Run only the new migration SQL file directly (see "Recommended workflow" below).

---

### 2. `drizzle-kit push` – Dangerous proposed changes

**Behaviour:** Push compares the schema to the live database and proposes changes to reconcile them.

**Problems:**
- Proposes dropping and re-adding foreign key constraints (can cause downtime or cascades)
- Proposes **dropping `transcription_chunks_id_seq1`** – **never allow this**. The sequence is required by the `transcription_chunks` table. See `drizzle.config.ts` tablesFilter.
- Proposes dropping indexes (e.g. `users_referral_code_unique`) that may be in use

**Fix:** Do not use push. Use explicit migration SQL files instead.

---

### 3. `transcription_chunks` sequence

The config excludes `transcription_chunks` via `tablesFilter`, but Drizzle can still propose dropping its internal sequence (`transcription_chunks_id_seq1`). If you see a prompt that includes `DROP SEQUENCE` for this table: **always abort**.

---

## Recommended Workflow

### Adding new columns or tables

1. **Create migration SQL** in `database/migrations/` (e.g. `0039_description.sql`):
   ```sql
   ALTER TABLE "my_table" ADD COLUMN IF NOT EXISTS "my_column" text;
   ```

2. **Update schema** in `database/schema/` to match (so Drizzle schema and DB stay in sync).

3. **Apply the migration directly** – do not use `drizzle-kit migrate`:
   - **Neon:** Open SQL Editor, paste the migration SQL, run it.
   - **psql:** `psql "$DATABASE_URL" -f database/migrations/0039_description.sql`
   - **Node/tsx:** Read the file and execute via your DB client.

### Generating migration files

You can use `drizzle-kit generate` to create a migration file from schema changes. That is safe. The problem is **applying** migrations via `drizzle-kit migrate` or `push`.

---

## Commands Summary

| Command | Safe? | Notes |
|---------|-------|-------|
| `drizzle-kit generate` | Yes | Generates migration SQL from schema; does not touch DB |
| `drizzle-kit migrate` | No | Replays all migrations; fails with "already exists" |
| `drizzle-kit push` | No | Proposes dangerous changes (constraints, sequences) |
| Run migration SQL directly | Yes | Preferred way to apply schema changes |

---

## For AI Agents

When the user asks to:
- Add a column or table
- Run a migration
- Apply schema changes

1. Create/update the migration SQL file.
2. Update `database/schema/*` to match.
3. Tell the user to run the SQL file directly (Neon, psql, or script).
4. Do **not** suggest `pnpm drizzle-kit migrate` or `pnpm drizzle-kit push`.
