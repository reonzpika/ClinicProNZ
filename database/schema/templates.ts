import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const templates = pgTable('templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type', { enum: ['default', 'custom'] }).notNull(),
  ownerId: text('owner_id').references(() => users.id),
  sections: jsonb('sections').notNull(), // Array of section objects
  prompts: jsonb('prompts').notNull(), // System and structure prompts
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
