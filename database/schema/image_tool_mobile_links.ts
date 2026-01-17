import { boolean, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const imageToolMobileLinks = pgTable('image_tool_mobile_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    tokenUnique: uniqueIndex('image_tool_mobile_links_token_unique').on(table.token),
  };
});

export type ImageToolMobileLink = typeof imageToolMobileLinks.$inferSelect;
export type NewImageToolMobileLink = typeof imageToolMobileLinks.$inferInsert;

