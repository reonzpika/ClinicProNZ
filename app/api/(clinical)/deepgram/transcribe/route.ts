import { Buffer } from 'node:buffer';

import { createClient } from '@deepgram/sdk';
import * as Ably from 'ably';
import { getDb } from 'database/client';
import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { patientSessions, users } from '@/db/schema';
import { checkCoreAccess, extractRBACContext } from '@/src/lib/rbac-enforcer';
import { createUserSession } from '@/src/lib/services/guest-session-service';

export const runtime = 'nodejs'; // Ensure Node.js runtime for Buffer support

export const config = {
  api: {
    bodyParser: false, // Required for formidable to handle multipart
    sizeLimit: '100mb',
  },
};

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    // Extract RBAC context and check authentication
    const context = await extractRBACContext(req);
    const permissionCheck = await checkCoreAccess(context);

    if (!permissionCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: permissionCheck.reason || 'Access denied',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Parse query for persist mode
    const url = new URL(req.url);
    const persist = url.searchParams.get('persist') === 'true';
    try {
 console.log('[Transcribe] persist=', persist);
} catch {}

    // Parse multipart form data using Web API
    const formData = await req.formData();
    const file = formData.get('audio');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No audio file uploaded' }, { status: 400 });
    }

    // Removed session validation - desktop handles session management in simplified architecture

    // Convert file (Blob) to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // Initialize Deepgram client
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

    // Transcribe the audio file - optimized for pre-recorded processing
    const deepgramConfig = {
      model: 'nova-3', // Default to general nova-3 for broad access
      punctuate: true,
      language: 'en-NZ', // NZ English is supported by nova-3-medical
      smart_format: true,
      redact: ['name_given', 'name_family'],
      diarize: false, // Disable speaker diarization
      paragraphs: true, // Keep paragraphs for better formatting
      utterances: true, // Enable word-level data with timestamps & confidence
      profanity_filter: false, // Medical context may include profanity in symptoms/conditions
      filler_words: false, // Remove "um", "uh", etc. for cleaner clinical notes
    };
    try {
 console.log('[Transcribe] model=', deepgramConfig.model, 'language=', deepgramConfig.language);
} catch {}
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      deepgramConfig,
    );

    if (error) {
      try {
 console.error('[Transcribe] Deepgram error', error);
} catch {}
      return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
    }

    // Extract transcript, paragraphs, metadata AND enhanced data
    const alt = result?.results?.channels?.[0]?.alternatives?.[0];
    const transcript = alt?.transcript || '';
    const paragraphs = alt?.paragraphs || [];
    const metadata = result?.metadata || {};

    // NEW: Extract confidence and word-level data for enhanced transcription
    const confidence = alt?.confidence || null;

    // Defer Deepgram cost tracking to recording stop to aggregate per session

    // 🆕 UPDATED: Extract words from utterances (preferred) or alternatives fallback
    const utterances = result?.results?.utterances || [];
    const words = utterances.length > 0
      ? utterances.flatMap((utterance: any) => utterance.words || [])
      : (alt?.words || []);

    // If not persisting, just return the transcription as before
    if (!persist) {
      const apiResponse = {
        transcript, // return plain transcript
        paragraphs,
        metadata,
        // legacy fields retained but clients may ignore
        confidence,
        words,
      } as any;
      try {
 console.log('[Transcribe] non-persist response', { transcriptLen: (transcript || '').length });
} catch {}
      return NextResponse.json(apiResponse);
    }

    // Persist mode: append chunk to user's current session and signal desktop
    const userId = context.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Ensure a current session exists for the user
    let currentSessionId: string | null = null;
    try {
      const current = await db
        .select({ currentSessionId: users.currentSessionId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      currentSessionId = current?.[0]?.currentSessionId || null;
    } catch {}

    if (!currentSessionId) {
      // Auto-create a new session and set as current
      const newSession = await createUserSession(userId, 'Patient');
      currentSessionId = newSession?.id as string;
      try {
        await db.update(users).set({ currentSessionId }).where(eq(users.id, userId));
      } catch {}
      try {
 console.log('[Transcribe] created new session', currentSessionId);
} catch {}
    }

    // Load existing transcriptions for the session
    const existing = await db
      .select({ id: patientSessions.id, transcriptions: patientSessions.transcriptions })
      .from(patientSessions)
      .where(and(eq(patientSessions.id, currentSessionId), eq(patientSessions.userId, userId)))
      .limit(1);

    if (!existing.length) {
      try {
 console.warn('[Transcribe] session not found for user', userId, 'session', currentSessionId);
} catch {}
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const existingTranscriptionsRaw = existing[0]?.transcriptions || '[]';
    let existingTranscriptions: Array<any> = [];
    try {
      existingTranscriptions = JSON.parse(existingTranscriptionsRaw || '[]');
      if (!Array.isArray(existingTranscriptions)) {
        existingTranscriptions = [];
      }
    } catch {
      existingTranscriptions = [];
    }

    // Skip empty chunks to avoid noisy updates
    if (!transcript || !transcript.trim()) {
      return NextResponse.json({ persisted: false, chunkId: null, sessionId: currentSessionId });
    }

    // Append new chunk (drop enhanced fields per spec)
    const chunkId = Math.random().toString(36).substr(2, 9);
    const newEntry = {
      id: chunkId,
      text: (transcript || '').trim(),
      timestamp: new Date().toISOString(),
      source: 'mobile' as const,
      // Store duration so we can aggregate cost at recording stop
      durationSec: Number(metadata?.duration || 0),
    };
    const updatedTranscriptions = [...existingTranscriptions, newEntry];

    await db
      .update(patientSessions)
      .set({ transcriptions: JSON.stringify(updatedTranscriptions), updatedAt: new Date() })
      .where(and(eq(patientSessions.id, currentSessionId), eq(patientSessions.userId, userId)));
    try {
 console.log('[Transcribe] persisted chunk', { sessionId: currentSessionId, chunkId, textLen: newEntry.text.length });
} catch {}

    // Defer Deepgram cost tracking to recording stop to aggregate per session

    // Signal desktop via Ably (best-effort). Ensure single publish per chunk with helpful logs.
    try {
      if (process.env.ABLY_API_KEY) {
        const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY });
        const channel = ably.channels.get(`user:${userId}`);
        const payload = {
          type: 'transcriptions_updated',
          sessionId: currentSessionId,
          chunkId,
          timestamp: Date.now(),
        } as any;
        await channel.publish('transcriptions_updated', payload);
      }
    } catch {}

    return NextResponse.json({
      persisted: true,
      chunkId,
      sessionId: currentSessionId,
      transcript,
      words,
      confidence,
      paragraphs,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
