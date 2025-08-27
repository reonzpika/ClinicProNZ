import { db } from '../../../database/client';
import { patientSessions } from '../../../database/schema';

/**
 * Create a new patient session for an authenticated user
 */
export async function createUserSession(userId: string, patientName: string, templateId?: string) {
  // Create the patient session
  const newSession = await db
    .insert(patientSessions)
    .values({
      userId,
      patientName: patientName.trim(),
      templateId,
      status: 'active',
      transcriptions: JSON.stringify([]),
      consultationItems: JSON.stringify([]),

      typedInput: '',
      consultationNotes: '',
      notes: '',
    })
    .returning();

  return newSession[0];
}
