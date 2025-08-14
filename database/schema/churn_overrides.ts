import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const churnOverrides = pgTable('churn_overrides', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id),
  stripeCustomerId: text('stripe_customer_id'),
  status: text('status').notNull().default('active'), // 'active' | 'churned'
  reason: text('reason'),
  effectiveDate: timestamp('effective_date').notNull(),
  source: text('source').notNull().default('manual'), // 'manual' | 'stripe'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});