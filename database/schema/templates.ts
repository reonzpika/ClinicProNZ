import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const templates = pgTable('templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type', { enum: ['default', 'custom'] }).notNull(),
  ownerId: text('owner_id').references(() => users.id),
  templateBody: text('template_body').notNull(), // Natural language template with placeholders
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
