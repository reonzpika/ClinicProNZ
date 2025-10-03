import { auth } from '@clerk/nextjs/server';
import { getDb } from 'database/client';
import { and, desc, eq, isNull, gt } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { patientSessions, users } from '@/db/schema';

// GET - List patient sessions for a user
export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    // Get authenticated user (middleware ensures user is authenticated)
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status') as 'active' | 'completed' | 'archived' | null;
    const singleId = url.searchParams.get('sessionId');
    const limit = Number.parseInt(url.searchParams.get('limit') || '50');

    // Query authenticated user sessions (optionally scoped to a single session)
    let query = db
      .select()
      .from(patientSessions)
      .where(and(eq(patientSessions.userId, userId), isNull(patientSessions.deletedAt)))
      .orderBy(desc(patientSessions.createdAt))
      .limit(limit);

    if (singleId) {
      // Return a single session owned by the user
      const one = await db
        .select()
        .from(patientSessions)
        .where(
          and(
            eq(patientSessions.userId, userId),
            eq(patientSessions.id, singleId),
            isNull(patientSessions.deletedAt),
          ),
        )
        .limit(1);

      const sessions = one.map((session: any) => ({
        ...session,
        createdAt: session.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: session.updatedAt?.toISOString() || new Date().toISOString(),
        completedAt: session.completedAt?.toISOString() || null,
        transcriptions: session.transcriptions ? JSON.parse(session.transcriptions) : [],
        consultationItems: session.consultationItems ? JSON.parse(session.consultationItems) : [],
      }));

      return NextResponse.json({ sessions });
    }

    if (status) {
      query = db
        .select()
        .from(patientSessions)
        .where(
          and(
            eq(patientSessions.userId, userId),
            eq(patientSessions.status, status),
            isNull(patientSessions.deletedAt),
          ),
        )
        .orderBy(desc(patientSessions.createdAt))
        .limit(limit);
    }

    const sessions = await query;

    return NextResponse.json({
      sessions: sessions.map((session: any) => ({
        ...session,
        // Convert dates to ISO strings for client compatibility
        createdAt: session.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: session.updatedAt?.toISOString() || new Date().toISOString(),
        completedAt: session.completedAt?.toISOString() || null,
        // Parse JSON fields
        transcriptions: session.transcriptions ? JSON.parse(session.transcriptions) : [],
        consultationItems: session.consultationItems ? JSON.parse(session.consultationItems) : [],
      })),
    });
  } catch (error) {
    console.error('Error fetching patient sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

// POST - Create a new patient session
export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    // Get authenticated user (middleware ensures user is authenticated)
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { patientName, templateId } = await req.json();

    // Ensure users row exists to satisfy FK constraints (defensive against webhook delays)
    try {
      await db
        .insert(users)
        .values({ id: userId })
        .onConflictDoNothing();
    } catch {}

    if (!patientName || !patientName.trim()) {
      return NextResponse.json({ error: 'Patient name is required' }, { status: 400 });
    }

    // Create new patient session
    const { createUserSession } = await import('@/src/lib/services/guest-session-service');

    const session = await createUserSession(
      userId,
      patientName.trim(),
      templateId,
    );

    // Note: Mobile devices will be notified via Ably when patient session changes
    // Persist as current session for this user for mobile fallback
    try {
      if (session && session.id) {
        await db.update(users).set({ currentSessionId: session.id }).where(eq(users.id, userId));
      }
    } catch {
      // best effort
    }

    return NextResponse.json({
      session: {
        ...session,
        // Convert dates to ISO strings for client compatibility
        createdAt: session?.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: session?.updatedAt?.toISOString() || new Date().toISOString(),
        completedAt: session?.completedAt?.toISOString() || null,
        // Drop legacy transcriptions from response
        consultationItems: [],
      },
    });
  } catch (error) {
    console.error('Error creating patient session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

// PUT - Update patient session
export async function PUT(req: NextRequest) {
  try {
    const db = getDb();
    // Get authenticated user (middleware ensures user is authenticated)
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const {
      sessionId,
      patientName,
      status,
      notes,
      typedInput,
      consultationNotes,
      templateId,
      problemsText,
      objectiveText,
      assessmentText,
      planText,
      consultationItems,
    } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Build update object dynamically
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (patientName !== undefined) {
      updateData.patientName = patientName;
    }
    if (status !== undefined) {
      updateData.status = status;
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    if (typedInput !== undefined) {
      updateData.typedInput = typedInput;
    }
    if (consultationNotes !== undefined) {
 updateData.consultationNotes = consultationNotes;
}
    if (templateId !== undefined) {
      updateData.templateId = templateId;
    }
    if (problemsText !== undefined) {
 updateData.problemsText = problemsText;
}
    if (objectiveText !== undefined) {
 updateData.objectiveText = objectiveText;
}
    if (assessmentText !== undefined) {
 updateData.assessmentText = assessmentText;
}
    if (planText !== undefined) {
 updateData.planText = planText;
}
    // transcriptions field deprecated (server-authoritative chunks table)
    if (consultationItems !== undefined) {
      updateData.consultationItems = JSON.stringify(consultationItems);
    }

    // Set completedAt when status changes to completed
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    // Update session with proper ownership check
    const whereClause = and(
      eq(patientSessions.id, sessionId),
      eq(patientSessions.userId, userId),
    );

    const updatedSession = await db
      .update(patientSessions)
      .set(updateData)
      .where(whereClause)
      .returning();

    if (updatedSession.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = updatedSession[0]!;

    return NextResponse.json({
      session: {
        ...session,
        // Convert dates to ISO strings for client compatibility
        createdAt: session?.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: session?.updatedAt?.toISOString() || new Date().toISOString(),
        completedAt: session?.completedAt?.toISOString() || null,
        // Parse JSON fields (transcriptions removed)
        consultationItems: session.consultationItems ? JSON.parse(session.consultationItems) : [],
      },
    });
  } catch (error) {
    console.error('Error updating patient session:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}

  // DELETE - Delete patient session
export async function DELETE(req: NextRequest) {
  try {
    const db = getDb();
    // Get authenticated user (middleware ensures user is authenticated)
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { sessionId, deleteAll } = await req.json();

    // Helper: generate default patient name (matches UI style)
    const generatePatientName = () => {
      return 'Patient';
    };

    // Helper: choose next session (most recent, non-deleted, non-expired). If none, create a new one.
    const selectOrCreateNextSession = async (): Promise<{ id: string; createdNew: boolean }> => {
      // Prefer most recent non-deleted, non-expired session
      const now = new Date();
      const nextActive = await db
        .select()
        .from(patientSessions)
        .where(
          and(
            eq(patientSessions.userId, userId),
            isNull(patientSessions.deletedAt),
            gt(patientSessions.expiresAt, now),
          ),
        )
        .orderBy(desc(patientSessions.createdAt))
        .limit(1);

      if (nextActive.length > 0) {
        return { id: nextActive[0]!.id, createdNew: false } as { id: string; createdNew: boolean };
      }

      // No active session available → create a new one
      const { createUserSession } = await import('@/src/lib/services/guest-session-service');
      const newSession = await createUserSession(userId, generatePatientName());
      if (!newSession || !newSession.id) {
        throw new Error('Failed to create fallback session');
      }
      return { id: newSession.id as string, createdNew: true };
    };

    // Handle delete all sessions
    if (deleteAll === true) {
      const deleteAllClause = eq(patientSessions.userId, userId);

      const deletedSessions = await db
        .update(patientSessions)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(deleteAllClause)
        .returning();

      // Always create a fresh session and set as current
      const next = await selectOrCreateNextSession();
      try {
        await db.update(users).set({ currentSessionId: next.id }).where(eq(users.id, userId));
      } catch {}

      return NextResponse.json({
        success: true,
        message: `${deletedSessions.length} sessions deleted successfully`,
        deletedCount: deletedSessions.length,
        currentSessionId: next.id,
        createdNew: next.createdNew,
      });
    }

    // Handle single session delete (soft-delete)
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Soft-delete session (only if it belongs to the user)
    const whereClause = and(
      eq(patientSessions.id, sessionId),
      eq(patientSessions.userId, userId),
    );

    const deletedSession = await db
      .update(patientSessions)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(whereClause)
      .returning();

    if (deletedSession.length === 0) {
      return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 });
    }

    // If the deleted session was the current one, choose a replacement and update user
    const response: any = {
      success: true,
      message: 'Session deleted successfully',
      deletedSessionId: sessionId,
    };

    try {
      // Read currentSessionId from users
      const currentRows = await db
        .select({ currentSessionId: users.currentSessionId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      const currentId = currentRows?.[0]?.currentSessionId || null;

      // If the deleted session was the current one → pick or create next
      if (currentId && currentId === sessionId) {
        const next = await selectOrCreateNextSession();
        await db.update(users).set({ currentSessionId: next.id }).where(eq(users.id, userId));
        response.currentSessionId = next.id;
        response.createdNew = next.createdNew;
        response.switchedToExisting = !next.createdNew;
      } else {
        // Even if current wasn't deleted, ensure at least one ACTIVE session exists for the user
        const now = new Date();
        const stillHasActive = await db
          .select({ id: patientSessions.id })
          .from(patientSessions)
          .where(
            and(
              eq(patientSessions.userId, userId),
              isNull(patientSessions.deletedAt),
              gt(patientSessions.expiresAt, now),
            ),
          )
          .limit(1);
        if (stillHasActive.length === 0) {
          const next = await selectOrCreateNextSession();
          await db.update(users).set({ currentSessionId: next.id }).where(eq(users.id, userId));
          response.currentSessionId = next.id;
          response.createdNew = next.createdNew;
          response.switchedToExisting = !next.createdNew;
        }
      }
    } catch {}

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting patient session:', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
