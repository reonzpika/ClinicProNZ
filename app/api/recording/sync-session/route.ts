import { NextResponse } from 'next/server';

// In-memory store for session state (in production, use Redis or database)
const sessionState: Record<string, {
  transcriptions: Array<{ transcript: string; timestamp: number; source: 'mobile' | 'desktop' }>;
  lastUpdate: string;
}> = {};

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

    // Initialize session state if not exists
    if (!sessionState[sessionId]) {
      sessionState[sessionId] = {
        transcriptions: [],
        lastUpdate: new Date().toISOString(),
      };
    }

    // Filter transcriptions since last checkpoint
    let newTranscriptions = sessionState[sessionId].transcriptions;

    if (lastCheckpoint) {
      const checkpointTime = new Date(lastCheckpoint).getTime();
      newTranscriptions = sessionState[sessionId].transcriptions.filter(
        t => t.timestamp > checkpointTime,
      );
    }

    return NextResponse.json({
      transcriptions: newTranscriptions,
      lastUpdate: sessionState[sessionId].lastUpdate,
      hasNewData: newTranscriptions.length > 0,
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
export async function POST(req: Request) {
  try {
    const { sessionId, transcript, source } = await req.json();

    if (!sessionId || !transcript || !source) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Initialize session state if not exists
    if (!sessionState[sessionId]) {
      sessionState[sessionId] = {
        transcriptions: [],
        lastUpdate: new Date().toISOString(),
      };
    }

    // Add transcription to session
    const timestamp = Date.now();
    sessionState[sessionId].transcriptions.push({
      transcript: transcript.trim(),
      timestamp,
      source: source as 'mobile' | 'desktop',
    });

    sessionState[sessionId].lastUpdate = new Date().toISOString();

    // Clean up old transcriptions (keep last 100)
    if (sessionState[sessionId].transcriptions.length > 100) {
      sessionState[sessionId].transcriptions = sessionState[sessionId].transcriptions.slice(-100);
    }

    // For mobile transcriptions, trigger server-side events to notify desktop clients
    // In a real production system, you'd use WebSockets, Server-Sent Events, or a message queue
    // For this implementation, we'll rely on polling from the desktop side

    return NextResponse.json({
      success: true,
      lastUpdate: sessionState[sessionId].lastUpdate,
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
