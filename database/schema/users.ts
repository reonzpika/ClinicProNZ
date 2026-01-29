import { date, integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique(),
  coreSessionsUsed: integer('core_sessions_used').default(0).notNull(),
  sessionResetDate: date('session_reset_date').defaultNow().notNull(),
  // GP Referral Images tier tracking
  imageTier: text('image_tier').default('free').notNull(),
  // Stripe payment tracking for GP Referral Images
  stripePaymentId: varchar('stripe_payment_id', { length: 500 }),
  upgradedAt: timestamp('upgraded_at'),
  // Persist the user's currently selected patient session for mobile fallback
  currentSessionId: text('current_session_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
