import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const contactMessages = pgTable('contact_messages', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  userTier: text('user_tier'), // if logged in user
  userId: text('user_id'), // if logged in user
  source: text('source').default('contact_page'),
  status: text('status').default('unread'), // unread, read, actioned
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
