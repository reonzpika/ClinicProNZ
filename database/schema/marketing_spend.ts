import { date, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const marketingSpend = pgTable('marketing_spend', {
  id: uuid('id').primaryKey().defaultRandom(),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  amountNzdCents: integer('amount_nzd_cents').notNull(),
  channel: text('channel').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});