import { and, eq, lt, or } from 'drizzle-orm';

import { db } from '../../../database/client';
import { patientSessions } from '../../../database/schema';

/**
 * Clean up temporary sessions that are completed or older than 24 hours
 */
export async function cleanupTemporarySessions(): Promise<number> {
  const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

  const deletedSessions = await db
    .delete(patientSessions)
    .where(
      and(
        eq(patientSessions.isTemporary, true),
        or(
          eq(patientSessions.status, 'completed'),
          eq(patientSessions.status, 'archived'),
          lt(patientSessions.createdAt, cutoffTime),
        ),
      ),
    )
    .returning({ id: patientSessions.id });

  return deletedSessions.length;
}

/**
 * Clean up a specific temporary session when it's completed
 */
export async function cleanupCompletedTemporarySession(sessionId: string): Promise<boolean> {
  try {
    const deletedSession = await db
      .delete(patientSessions)
      .where(
        and(
          eq(patientSessions.id, sessionId),
          eq(patientSessions.isTemporary, true),
          or(
            eq(patientSessions.status, 'completed'),
            eq(patientSessions.status, 'archived'),
          ),
        ),
      )
      .returning({ id: patientSessions.id });

    return deletedSession.length > 0;
  } catch (error) {
    console.error('Error cleaning up temporary session:', error);
    return false;
  }
}

/**
 * Mark temporary session as completed and schedule cleanup
 */
export async function completeTemporarySession(sessionId: string): Promise<boolean> {
  try {
    // Update session status to completed
    await db
      .update(patientSessions)
      .set({
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(patientSessions.id, sessionId),
          eq(patientSessions.isTemporary, true),
        ),
      );

    // Immediate cleanup for completed temporary sessions
    return await cleanupCompletedTemporarySession(sessionId);
  } catch (error) {
    console.error('Error completing temporary session:', error);
    return false;
  }
}
