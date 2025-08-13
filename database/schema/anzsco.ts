import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const anzscoOccupations = pgTable('anzsco_occupations', {
	id: uuid('id').primaryKey().defaultRandom(),
	code: text('code').notNull(),
	title: text('title').notNull(),
	description: text('description'),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export type AnzscoOccupation = typeof anzscoOccupations.$inferSelect;
export type NewAnzscoOccupation = typeof anzscoOccupations.$inferInsert;