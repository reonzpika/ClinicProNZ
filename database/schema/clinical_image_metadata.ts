import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { patientSessions } from './patient_sessions';
import { users } from './users';

// Stores user-defined display names and related metadata for clinical images
export const clinicalImageMetadata = pgTable('clinical_image_metadata', {
  imageKey: text('image_key').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionId: uuid('session_id').references(() => patientSessions.id, { onDelete: 'set null' }),
  displayName: text('display_name'),
  patientName: text('patient_name'),
  identifier: text('identifier'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type ClinicalImageMetadata = typeof clinicalImageMetadata.$inferSelect;
export type NewClinicalImageMetadata = typeof clinicalImageMetadata.$inferInsert;
