import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const featureRequests = pgTable('feature_requests', {
  id: serial('id').primaryKey(),
  idea: varchar('idea', { length: 256 }).notNull(),
  details: varchar('details', { length: 1024 }),
  email: varchar('email', { length: 128 }),
  ip_address: varchar('ip_address', { length: 64 }),
  status: text('status').default('unread'), // unread, read, actioned
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
