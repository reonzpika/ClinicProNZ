import { getDb } from '../../../database/client';
import { patientSessions } from '../../../database/schema';

/**
 * Create a new patient session for an authenticated user
 */
export async function createUserSession(userId: string, patientName: string, templateId?: string) {
  const db = getDb();
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
      // Set absolute expiry to 12 hours from creation
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
    })
    .returning();

  return newSession[0];
}
