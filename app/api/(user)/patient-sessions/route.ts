import { and, desc, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { patientSessions } from '@/db/schema';
import { checkFeatureAccess, extractRBACContext } from '@/src/lib/rbac-enforcer';

// GET - List patient sessions for a user
export async function GET(req: NextRequest) {
  try {
    console.log('[Patient Sessions API] GET request received');
    
    // Extract RBAC context and check session history permissions
    const context = await extractRBACContext(req);
    console.log('[Patient Sessions API] RBAC context extracted:', {
      userId: context.userId ? `${context.userId.substring(0, 8)}...` : null,
      tier: context.tier,
      isAuthenticated: context.isAuthenticated,
      hasGuestToken: !!context.guestToken,
    });
    
    const permissionCheck = await checkFeatureAccess(context, 'session-history');
    console.log('[Patient Sessions API] Permission check result for session-history:', permissionCheck);

    if (!permissionCheck.allowed) {
      console.log('[Patient Sessions API] Access denied for session-history:', {
        reason: permissionCheck.reason,
        upgradePrompt: permissionCheck.upgradePrompt,
        context: {
          tier: context.tier,
          isAuthenticated: context.isAuthenticated,
        }
      });
      
      return new Response(
        JSON.stringify({
          error: permissionCheck.reason || 'Access denied',
          message: permissionCheck.upgradePrompt || 'Session management requires Standard tier or higher',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // FIXED: Use RBAC context instead of requiring x-user-id header
    const { userId, guestToken } = context;

    // Either authenticated user or guest token required
    if (!userId && !guestToken) {
      console.log('[Patient Sessions API] No authentication found');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status') as 'active' | 'completed' | 'archived' | null;
    const limit = Number.parseInt(url.searchParams.get('limit') || '50');

    let query;

    if (userId) {
      // Authenticated user sessions
      query = db
        .select()
        .from(patientSessions)
        .where(
          and(
            eq(patientSessions.userId, userId),
            eq(patientSessions.isTemporary, false), // Only show persistent sessions
          ),
        )
        .orderBy(desc(patientSessions.createdAt))
        .limit(limit);

      if (status) {
        query = db
          .select()
          .from(patientSessions)
          .where(
            and(
              eq(patientSessions.userId, userId),
              eq(patientSessions.status, status),
              eq(patientSessions.isTemporary, false), // Only show persistent sessions
            ),
          )
          .orderBy(desc(patientSessions.createdAt))
          .limit(limit);
      }
    } else if (guestToken) {
      // Guest user sessions
      query = db
        .select()
        .from(patientSessions)
        .where(eq(patientSessions.guestToken, guestToken))
        .orderBy(desc(patientSessions.createdAt))
        .limit(limit);

      if (status) {
        query = db
          .select()
          .from(patientSessions)
          .where(
            and(
              eq(patientSessions.guestToken, guestToken),
              eq(patientSessions.status, status),
            ),
          )
          .orderBy(desc(patientSessions.createdAt))
          .limit(limit);
      }
    }

    // FIXED: Ensure query is defined before executing
    if (!query) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    const sessions = await query;

    return NextResponse.json({
      sessions: sessions.map(session => ({
        ...session,
        transcriptions: session.transcriptions ? JSON.parse(session.transcriptions) : [],
        consultationItems: session.consultationItems ? JSON.parse(session.consultationItems) : [],
        clinicalImages: session.clinicalImages ? JSON.parse(session.clinicalImages) : [],
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
    console.log('[Patient Sessions API] POST request received');
    
    // Extract RBAC context and check session management permissions
    const context = await extractRBACContext(req);
    console.log('[Patient Sessions API] POST RBAC context:', {
      userId: context.userId ? `${context.userId.substring(0, 8)}...` : null,
      tier: context.tier,
      isAuthenticated: context.isAuthenticated,
      hasGuestToken: !!context.guestToken,
    });
    
    const permissionCheck = await checkFeatureAccess(context, 'sessions');
    console.log('[Patient Sessions API] POST Permission check result for sessions:', permissionCheck);

    if (!permissionCheck.allowed) {
      console.log('[Patient Sessions API] POST Access denied for sessions:', {
        reason: permissionCheck.reason,
        upgradePrompt: permissionCheck.upgradePrompt,
        context: {
          tier: context.tier,
          isAuthenticated: context.isAuthenticated,
        }
      });
      
      return new Response(
        JSON.stringify({
          error: permissionCheck.reason || 'Access denied',
          message: permissionCheck.upgradePrompt || 'Session management requires Standard tier or higher',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // FIXED: Use RBAC context instead of requiring x-user-id header
    const { userId, guestToken } = context;

    const { patientName, templateId } = await req.json();

    if (!patientName || !patientName.trim()) {
      return NextResponse.json({ error: 'Patient name is required' }, { status: 400 });
    }

    // Create new patient session using service (handles tier-based temporary sessions)
    const { createUserSession, createGuestSession } = await import('@/src/lib/services/guest-session-service');

    let session;
    if (userId) {
      // Authenticated user
      session = await createUserSession(
        userId,
        patientName.trim(),
        templateId,
        context.tier,
      );
    } else if (guestToken) {
      // Guest user
      session = await createGuestSession(
        guestToken,
        patientName.trim(),
        templateId,
      );
    } else {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Note: Mobile devices will be notified via Ably when patient session changes
    return NextResponse.json({
      session: {
        ...session,
        transcriptions: [],
        consultationItems: [],
        clinicalImages: [],
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
    // Extract RBAC context and check session management permissions
    const context = await extractRBACContext(req);
    const permissionCheck = await checkFeatureAccess(context, 'sessions');

    if (!permissionCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: permissionCheck.reason || 'Access denied',
          message: permissionCheck.upgradePrompt || 'Session management requires Standard tier or higher',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // FIXED: Use RBAC context instead of requiring x-user-id header
    const { userId, guestToken } = context;

    const {
      sessionId,
      patientName,
      status,
      transcriptions,
      notes,
      typedInput,
      consultationNotes,
      consultationItems,
      clinicalImages,
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
    if (transcriptions !== undefined) {
      updateData.transcriptions = JSON.stringify(transcriptions);
    }
    if (consultationItems !== undefined) {
      updateData.consultationItems = JSON.stringify(consultationItems);
    }
    if (clinicalImages !== undefined) {
      updateData.clinicalImages = JSON.stringify(clinicalImages);
    }

    // Set completedAt when status changes to completed
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    // Update session with proper ownership check
    let whereClause;
    if (userId) {
      whereClause = and(
        eq(patientSessions.id, sessionId),
        eq(patientSessions.userId, userId),
      );
    } else if (guestToken) {
      whereClause = and(
        eq(patientSessions.id, sessionId),
        eq(patientSessions.guestToken, guestToken),
      );
    } else {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

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
        transcriptions: session.transcriptions ? JSON.parse(session.transcriptions) : [],
        consultationItems: session.consultationItems ? JSON.parse(session.consultationItems) : [],
        clinicalImages: session.clinicalImages ? JSON.parse(session.clinicalImages) : [],
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
    // Extract RBAC context and check session management permissions
    const context = await extractRBACContext(req);
    const permissionCheck = await checkFeatureAccess(context, 'sessions');

    if (!permissionCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: permissionCheck.reason || 'Access denied',
          message: permissionCheck.upgradePrompt || 'Session management requires Standard tier or higher',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // FIXED: Use RBAC context instead of requiring x-user-id header
    const { userId, guestToken } = context;

    const { sessionId, deleteAll } = await req.json();

    // Handle delete all sessions
    if (deleteAll === true) {
      let deleteAllClause;
      if (userId) {
        deleteAllClause = eq(patientSessions.userId, userId);
      } else if (guestToken) {
        deleteAllClause = eq(patientSessions.guestToken, guestToken);
      } else {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const deletedSessions = await db
        .delete(patientSessions)
        .where(deleteAllClause)
        .returning();

      return NextResponse.json({
        success: true,
        message: `${deletedSessions.length} sessions deleted successfully`,
        deletedCount: deletedSessions.length,
      });
    }

    // Handle single session delete
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Delete session (only if it belongs to the user)
    let whereClause;
    if (userId) {
      whereClause = and(
        eq(patientSessions.id, sessionId),
        eq(patientSessions.userId, userId),
      );
    } else if (guestToken) {
      whereClause = and(
        eq(patientSessions.id, sessionId),
        eq(patientSessions.guestToken, guestToken),
      );
    } else {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const deletedSession = await db
      .delete(patientSessions)
      .where(whereClause)
      .returning();

    if (deletedSession.length === 0) {
      return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully',
      deletedSessionId: sessionId,
    });
  } catch (error) {
    console.error('Error deleting patient session:', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
