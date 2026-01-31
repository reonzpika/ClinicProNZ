import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const referrals = pgTable(
  'referrals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    referrerId: text('referrer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    refereeId: text('referee_id').references(() => users.id, { onDelete: 'set null' }),
    referralCode: text('referral_code').notNull(),
    signupCompleted: boolean('signup_completed').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    signupAt: timestamp('signup_at'),
  },
  (table) => ({
    referrerIdx: index('referrals_referrer_idx').on(table.referrerId),
    codeIdx: index('referrals_code_idx').on(table.referralCode),
  })
);

export type Referral = typeof referrals.$inferSelect;
export type NewReferral = typeof referrals.$inferInsert;
