import { NextResponse } from 'next/server';

import { SessionSyncService } from '@/lib/services/session-sync.service';

// This endpoint allows desktop sessions to poll for mobile transcriptions
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');
    const lastCheckpoint = url.searchParams.get('lastCheckpoint');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 },
      );
    }

    // Use the shared session sync service
    const result = SessionSyncService.getTranscriptions(sessionId, lastCheckpoint || undefined);

    return NextResponse.json({
      transcriptions: result.transcriptions,
      lastUpdate: result.lastUpdate,
      hasNewData: result.hasNewData,
    });
  } catch (error) {
    console.error('Get session sync error:', error);
    return NextResponse.json(
      { error: 'Failed to get session data' },
      { status: 500 },
    );
  }
}

// This endpoint allows mobile devices to notify desktop sessions of new transcriptions
// Note: This is now primarily used by external clients since mobile-upload uses the service directly
export async function POST(req: Request) {
  try {
    const { sessionId, transcript, source } = await req.json();

    if (!sessionId || !transcript || !source) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Use the shared session sync service
    const result = SessionSyncService.addTranscription(
      sessionId,
      transcript.trim(),
      source as 'mobile' | 'desktop',
    );

    // For mobile transcriptions, trigger server-side events to notify desktop clients
    // In a real production system, you'd use WebSockets, Server-Sent Events, or a message queue
    // For this implementation, we'll rely on polling from the desktop side

    return NextResponse.json({
      success: result.success,
      lastUpdate: result.lastUpdate,
      transcriptionAdded: true,
    });
  } catch (error) {
    console.error('Sync session error:', error);
    return NextResponse.json(
      { error: 'Failed to sync session' },
      { status: 500 },
    );
  }
}
