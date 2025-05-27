import { pgTable, serial, varchar, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const featureStatusEnum = pgEnum('feature_status', ['planned', 'in_progress', 'completed']);

export const features = pgTable('features', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 128 }).notNull(),
  description: varchar('description', { length: 512 }).notNull(),
  status: featureStatusEnum('status').notNull(),
  vote_count: integer('vote_count').notNull().default(0),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}); 