import { auth } from '@clerk/nextjs/server';
import { and, desc, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/client';
import { WebSocketManager } from '@/lib/services/websocket-manager';
import { patientSessions } from '@/schema';

// GET - List patient sessions for a user
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status') as 'active' | 'completed' | 'archived' | null;
    const limit = Number.parseInt(url.searchParams.get('limit') || '50');

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

    return NextResponse.json({
      sessions: sessions.map(session => ({
        ...session,
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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { patientName, templateId } = await req.json();

    if (!patientName || !patientName.trim()) {
      return NextResponse.json({ error: 'Patient name is required' }, { status: 400 });
    }

    // Create new patient session
    const newSession = await db
      .insert(patientSessions)
      .values({
        userId,
        patientName: patientName.trim(),
        templateId,
        status: 'active',
        transcriptions: JSON.stringify([]),
        consultationItems: JSON.stringify([]),
      })
      .returning();

    const session = newSession[0]!;

    // Notify connected mobile devices about new session
    WebSocketManager.broadcastToUser(userId, {
      type: 'session_created',
      patientSessionId: session.id,
      patientName: session.patientName ?? undefined,
    });

    return NextResponse.json({
      session: {
        ...session,
        transcriptions: [],
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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      sessionId,
      patientName,
      status,
      transcriptions,
      notes,
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
    if (transcriptions !== undefined) {
      updateData.transcriptions = JSON.stringify(transcriptions);
    }
    if (consultationItems !== undefined) {
      updateData.consultationItems = JSON.stringify(consultationItems);
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
      },
    });
  } catch (error) {
    console.error('Error updating patient session:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}
