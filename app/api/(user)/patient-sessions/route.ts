import { and, desc, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { patientSessions } from '@/db/schema';
import { checkFeatureAccess, extractRBACContext } from '@/src/lib/rbac-enforcer';

// GET - List patient sessions for a user
export async function GET(req: NextRequest) {
  console.log('🚀 [patient-sessions GET] Request received');
  
  try {
    // Log headers received
    const headers = {
      'x-user-id': req.headers.get('x-user-id'),
      'x-user-tier': req.headers.get('x-user-tier'),
      'x-guest-token': req.headers.get('x-guest-token'),
    };
    console.log('📋 [patient-sessions GET] Headers:', headers);

    // Extract RBAC context and check session management permissions
    console.log('🔒 [patient-sessions GET] Extracting RBAC context...');
    const context = await extractRBACContext(req);
    console.log('🔒 [patient-sessions GET] RBAC context:', context);
    
    const permissionCheck = await checkFeatureAccess(context, 'sessions');
    console.log('🔒 [patient-sessions GET] Permission check:', permissionCheck);

    if (!permissionCheck.allowed) {
      console.log('❌ [patient-sessions GET] Permission denied');
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

    // Get userId from request headers (sent by client)
    const userId = req.headers.get('x-user-id');
    console.log('👤 [patient-sessions GET] UserId from headers:', userId);
    
    if (!userId) {
      console.log('❌ [patient-sessions GET] No userId in headers');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status') as 'active' | 'completed' | 'archived' | null;
    const limit = Number.parseInt(url.searchParams.get('limit') || '50');
    console.log('🔍 [patient-sessions GET] Query params - status:', status, 'limit:', limit);

    console.log('💾 [patient-sessions GET] Executing database query...');
    let query = db
      .select()
      .from(patientSessions)
      .where(eq(patientSessions.userId, userId))
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
          ),
        )
        .orderBy(desc(patientSessions.createdAt))
        .limit(limit);
    }

    const sessions = await query;
    console.log('✅ [patient-sessions GET] Database query successful, found', sessions.length, 'sessions');

    return NextResponse.json({
      sessions: sessions.map(session => ({
        ...session,
        transcriptions: session.transcriptions ? JSON.parse(session.transcriptions) : [],
        consultationItems: session.consultationItems ? JSON.parse(session.consultationItems) : [],
        clinicalImages: session.clinicalImages ? JSON.parse(session.clinicalImages) : [],
      })),
    });
  } catch (error) {
    console.error('❌ [patient-sessions GET] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

// POST - Create a new patient session
export async function POST(req: NextRequest) {
  console.log('🚀 [patient-sessions POST] Request received');
  
  try {
    // Log headers received
    const headers = {
      'x-user-id': req.headers.get('x-user-id'),
      'x-user-tier': req.headers.get('x-user-tier'),
      'x-guest-token': req.headers.get('x-guest-token'),
    };
    console.log('📋 [patient-sessions POST] Headers:', headers);

    // Extract RBAC context and check session management permissions
    console.log('🔒 [patient-sessions POST] Extracting RBAC context...');
    const context = await extractRBACContext(req);
    console.log('🔒 [patient-sessions POST] RBAC context:', context);
    
    const permissionCheck = await checkFeatureAccess(context, 'sessions');
    console.log('🔒 [patient-sessions POST] Permission check:', permissionCheck);

    if (!permissionCheck.allowed) {
      console.log('❌ [patient-sessions POST] Permission denied');
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

    // Get userId from request headers (sent by client)
    const userId = req.headers.get('x-user-id');
    console.log('👤 [patient-sessions POST] UserId from headers:', userId);
    
    if (!userId) {
      console.log('❌ [patient-sessions POST] No userId in headers');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📝 [patient-sessions POST] Parsing request body...');
    const { patientName, templateId } = await req.json();
    console.log('📝 [patient-sessions POST] Request body:', { patientName, templateId });

    if (!patientName || !patientName.trim()) {
      console.log('❌ [patient-sessions POST] Invalid patient name');
      return NextResponse.json({ error: 'Patient name is required' }, { status: 400 });
    }

    // Create new patient session
    console.log('💾 [patient-sessions POST] Creating new session in database...');
    const newSession = await db
      .insert(patientSessions)
      .values({
        userId,
        patientName: patientName.trim(),
        templateId,
        status: 'active',
        transcriptions: JSON.stringify([]),
        consultationItems: JSON.stringify([]),
        clinicalImages: JSON.stringify([]),
        typedInput: '',
        consultationNotes: '',
        notes: '',
      })
      .returning();

    const session = newSession[0]!;
    console.log('✅ [patient-sessions POST] Session created successfully with ID:', session.id);

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
    console.error('❌ [patient-sessions POST] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
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

    // Get userId from request headers (sent by client)
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Update session
    const updatedSession = await db
      .update(patientSessions)
      .set(updateData)
      .where(
        and(
          eq(patientSessions.id, sessionId),
          eq(patientSessions.userId, userId),
        ),
      )
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

    // Get userId from request headers (sent by client)
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, deleteAll } = await req.json();

    // Handle delete all sessions
    if (deleteAll === true) {
      const deletedSessions = await db
        .delete(patientSessions)
        .where(eq(patientSessions.userId, userId))
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
    const deletedSession = await db
      .delete(patientSessions)
      .where(
        and(
          eq(patientSessions.id, sessionId),
          eq(patientSessions.userId, userId),
        ),
      )
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
