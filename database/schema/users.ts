import { date, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique(),
  coreSessionsUsed: integer('core_sessions_used').default(0).notNull(),
  sessionResetDate: date('session_reset_date').defaultNow().notNull(),
  // Freemium standalone photo tool tier
  imageTier: text('image_tier').default('free').notNull(),
  // Persist the user's currently selected patient session for mobile fallback
  currentSessionId: text('current_session_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
