import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { users } from './users';

export const userSettings = pgTable('user_settings', {
  userId: text('user_id').primaryKey().references(() => users.id),
  settings: jsonb('settings').notNull(), // e.g. { templateOrder: [...] }
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
