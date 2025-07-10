import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const emailCaptures = pgTable('email_captures', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name'),
  practiceName: text('practice_name'),
  practiceSize: text('practice_size'), // Solo GP, 2-5 GPs, 6-10 GPs, 10+ GPs
  biggestChallenge: text('biggest_challenge'),
  source: text('source').default('landing_page'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
