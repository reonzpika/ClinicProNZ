import { and, eq, gt } from 'drizzle-orm';

import { db } from '../../../database/client';
import { patientSessions, users } from '../../../database/schema';

// Session limits for basic tier users
const GUEST_SESSION_LIMIT = 5;
const USER_SESSION_LIMIT = 5; // Same limit for authenticated basic tier users
const ROLLING_WINDOW_HOURS = 24;

export type GuestSessionStatus = {
  canCreateSession: boolean;
  sessionsUsed: number;
  sessionsRemaining: number;
  resetTime: Date;
};

export type UserSessionStatus = {
  canCreateSession: boolean;
  sessionsUsed: number;
  sessionsRemaining: number;
  resetTime: Date;
};

/**
 * Check if a guest token can create a new session
 */
export async function checkGuestSessionLimit(guestToken: string): Promise<GuestSessionStatus> {
  const twentyFourHoursAgo = new Date(Date.now() - ROLLING_WINDOW_HOURS * 60 * 60 * 1000);

  // Count sessions created in the last 24 hours for this guest token
  const sessions = await db
    .select()
    .from(patientSessions)
    .where(
      and(
        eq(patientSessions.guestToken, guestToken),
        gt(patientSessions.createdAt, twentyFourHoursAgo),
      ),
    );

  const sessionsUsed = sessions.length;
  const sessionsRemaining = Math.max(0, GUEST_SESSION_LIMIT - sessionsUsed);
  const canCreateSession = sessionsUsed < GUEST_SESSION_LIMIT;

  // Calculate reset time (24 hours from the oldest session)
  const resetTime = sessions.length > 0 && sessions[0]
    ? new Date(sessions[0].createdAt.getTime() + ROLLING_WINDOW_HOURS * 60 * 60 * 1000)
    : new Date(Date.now() + ROLLING_WINDOW_HOURS * 60 * 60 * 1000);

  return {
    canCreateSession,
    sessionsUsed,
    sessionsRemaining,
    resetTime,
  };
}

/**
 * Check if an authenticated user can create a new session (for basic tier users)
 */
export async function checkUserSessionLimit(userId: string): Promise<UserSessionStatus> {
  const today = new Date().toISOString().split('T')[0]!; // YYYY-MM-DD format

  // Get user session data
  const userRecords = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (userRecords.length === 0) {
    // User not found, create default entry
    await db
      .insert(users)
      .values({
        id: userId,
        email: null, // No fake email, webhook will update with real email if available
        coreSessionsUsed: 0,
        sessionResetDate: today,
      })
      .onConflictDoNothing();

    return {
      canCreateSession: true,
      sessionsUsed: 0,
      sessionsRemaining: USER_SESSION_LIMIT,
      resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    };
  }

  const user = userRecords[0];
  if (!user) {
    throw new Error('User record not found');
  }

  let sessionsUsed = user.coreSessionsUsed;
  let resetDate = user.sessionResetDate;

  // Check if we need to reset the counter (new day)
  if (resetDate && resetDate < today) {
    sessionsUsed = 0;
    resetDate = today;

    // Update the reset date and counter
    await db
      .update(users)
      .set({
        coreSessionsUsed: 0,
        sessionResetDate: today,
      })
      .where(eq(users.id, userId));
  }

  const sessionsRemaining = Math.max(0, USER_SESSION_LIMIT - sessionsUsed);
  const canCreateSession = sessionsUsed < USER_SESSION_LIMIT;

  // Calculate reset time (start of next day)
  const resetTime = new Date(resetDate);
  resetTime.setDate(resetTime.getDate() + 1);
  resetTime.setHours(0, 0, 0, 0);

  return {
    canCreateSession,
    sessionsUsed,
    sessionsRemaining,
    resetTime,
  };
}

/**
 * Create a new patient session for a guest token
 */
export async function createGuestSession(guestToken: string, patientName: string, templateId?: string) {
  const sessionStatus = await checkGuestSessionLimit(guestToken);

  if (!sessionStatus.canCreateSession) {
    throw new Error(`Guest session limit exceeded. You have used ${sessionStatus.sessionsUsed}/${GUEST_SESSION_LIMIT} sessions. Try again after ${sessionStatus.resetTime.toISOString()}`);
  }

  const newSession = await db
    .insert(patientSessions)
    .values({
      userId: null,
      guestToken,
      patientName: patientName.trim(),
      templateId,
      status: 'active',
      isTemporary: true, // Guest sessions are always temporary (basic tier)
      transcriptions: JSON.stringify([]),
      consultationItems: JSON.stringify([]),
      clinicalImages: JSON.stringify([]),
      typedInput: '',
      consultationNotes: '',
      notes: '',
    })
    .returning();
  return newSession[0];
}

/**
 * Create a new patient session for an authenticated user
 */
export async function createUserSession(userId: string, patientName: string, templateId?: string, userTier: 'basic' | 'standard' | 'premium' | 'admin' = 'basic') {
  let sessionStatus: any = null;

  // Only check session limits for basic tier users
  if (userTier === 'basic') {
    sessionStatus = await checkUserSessionLimit(userId);

    if (!sessionStatus.canCreateSession) {
      throw new Error(`User session limit exceeded. You have used ${sessionStatus.sessionsUsed}/${USER_SESSION_LIMIT} sessions. Try again after ${sessionStatus.resetTime.toISOString()}`);
    }
  }

  // Create the patient session
  const newSession = await db
    .insert(patientSessions)
    .values({
      userId,
      guestToken: null,
      patientName: patientName.trim(),
      templateId,
      status: 'active',
      isTemporary: userTier === 'basic', // Basic tier gets temporary sessions
      transcriptions: JSON.stringify([]),
      consultationItems: JSON.stringify([]),
      clinicalImages: JSON.stringify([]),
      typedInput: '',
      consultationNotes: '',
      notes: '',
    })
    .returning();

  // Increment the user's session counter (only for basic tier)
  if (userTier === 'basic' && sessionStatus) {
    await db
      .update(users)
      .set({
        coreSessionsUsed: sessionStatus.sessionsUsed + 1,
      })
      .where(eq(users.id, userId));
  }

  return newSession[0];
}

/**
 * Get session usage statistics for a guest token
 */
export async function getGuestSessionStats(guestToken: string): Promise<GuestSessionStatus> {
  return await checkGuestSessionLimit(guestToken);
}
