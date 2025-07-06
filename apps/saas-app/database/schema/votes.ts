import { integer, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

import { features } from './features';

export const votes = pgTable('votes', {
  id: serial('id').primaryKey(),
  feature_id: integer('feature_id').references(() => features.id).notNull(),
  ip_address: varchar('ip_address', { length: 64 }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
