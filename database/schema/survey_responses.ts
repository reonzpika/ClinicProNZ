import { boolean, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const surveyResponses = pgTable('survey_responses', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  email: text('email').notNull(),
  q1: jsonb('q1').$type<string[]>().notNull(),
  q2: text('q2').notNull(),
  q3: jsonb('q3').$type<Array<{ topic: 'notes' | 'guidance' | 'acc' | 'referrals' | 'images'; selected: string; free_text?: string }>>().notNull(),
  q4: jsonb('q4').$type<{ type: 'ai_scribe' | 'dictation' | 'none'; issue?: string; vendor?: string }>().notNull(),
  q5: integer('q5').notNull(),
  q5PriceBand: text('q5_price_band'),
  optedIn: boolean('opted_in').notNull(),
  callOptIn: boolean('call_opt_in').default(false).notNull(),
  goldLead: boolean('gold_lead').default(false).notNull(),
  priorityWeight: integer('priority_weight').notNull(),
  urgencyScore: integer('urgency_score').notNull(),
  rawPayload: jsonb('raw_payload').notNull(),
  ipAddress: text('ip_address'),
  tags: text('tags').array(),
});

