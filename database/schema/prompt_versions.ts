import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

/**
 * Versioned overrides for note-generation prompts.
 * Replace-only strategy with required placeholders validated at the service/API layer.
 * - systemText must include {{TEMPLATE}}
 * - userText must include {{DATA}}
 */
export const promptVersions = pgTable('prompt_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  versionNumber: integer('version_number').notNull(),
  systemText: text('system_text').notNull(),
  userText: text('user_text').notNull(),
  rating: integer('rating'), // optional 1–5
  feedback: text('feedback'),
  createdBy: text('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
