import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const patientSessions = pgTable('patient_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id),
  guestToken: text('guest_token'), // DEPRECATED: No longer used (anonymous access removed)
  patientName: text('patient_name'),
  patientId: text('patient_id'), // For future patient management system
  status: text('status', {
    enum: ['active', 'completed', 'archived'],
  }).notNull().default('active'),
  isRecording: boolean('is_recording').default(false).notNull(), // Server-truth recording flag

  transcriptions: text('transcriptions'), // JSON string of transcription array
  notes: text('notes'), // Generated consultation notes
  consultationNotes: text('consultation_notes'), // Legacy additional notes (deprecated)
  problemsText: text('problems_text'), // New: Problems
  objectiveText: text('objective_text'), // New: Objective
  assessmentText: text('assessment_text'), // New: Assessment
  planText: text('plan_text'), // New: Plan
  templateId: text('template_id'), // Link to template used
  consultationItems: text('consultation_items'), // JSON string of checklist/acc items
  clinicalImages: text('clinical_images'), // JSON string of clinical images
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
