import { index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

// One row per user per calendar month (YYYY-MM)
export const imageToolUsage = pgTable('image_tool_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  month: text('month').notNull(), // YYYY-MM
  imageCount: integer('image_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userMonthUnique: uniqueIndex('image_tool_usage_user_month_unique').on(table.userId, table.month),
    userIdx: index('image_tool_usage_user_idx').on(table.userId),
  };
});

export type ImageToolUsage = typeof imageToolUsage.$inferSelect;
export type NewImageToolUsage = typeof imageToolUsage.$inferInsert;
