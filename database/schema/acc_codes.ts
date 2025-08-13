import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const accCodes = pgTable('acc_codes', {
	id: uuid('id').primaryKey().defaultRandom(),
	readCode: text('read_code').notNull().unique(),
	preferredTerm: text('preferred_term').notNull(),
	synonyms: text('synonyms'), // comma-separated for simplicity
	description: text('description'),
	updatedAt: timestamp('updated_at').defaultNow(),
});

export type AccCode = typeof accCodes.$inferSelect;
export type NewAccCode = typeof accCodes.$inferInsert;