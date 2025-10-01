import { Buffer } from 'node:buffer';

import { createClient } from '@deepgram/sdk';
import * as Ably from 'ably';
import { getDb } from 'database/client';
import { and, eq, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { apiUsageCosts, patientSessions, users } from '@/db/schema';
import { calculateDeepgramCost } from '@/src/features/admin/cost-tracking/services/costCalculator';
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
    const debugEnabled = ((globalThis as any).process?.env?.DEBUG_TRANSCRIBE) === '1';
    const reqId = Math.random().toString(36).slice(2, 10);
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
    if (debugEnabled) {
      try {
        const hdrs = Object.fromEntries(req.headers.entries());
        console.log('[Transcribe][req]', { reqId, persist, headers: { 'content-type': hdrs['content-type'], 'content-length': hdrs['content-length'], 'x-debug-request-id': hdrs['x-debug-request-id'] } });
      } catch {}
    }

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
    if (debugEnabled) {
      try {
        const view = new Uint8Array(audioBuffer.subarray(0, 8));
        const headerHex = Array.from(view).map(b => b.toString(16).padStart(2, '0')).join('');
        console.log('[Transcribe][file]', { reqId, name: (file as any)?.name, type: (file as any)?.type, size: (file as any)?.size, byteLength: audioBuffer.byteLength, headerHex });
      } catch {}
    }

    // Initialize Deepgram client
    const deepgram = createClient(((globalThis as any).process?.env?.DEEPGRAM_API_KEY) as string);

    // Transcribe the audio file - optimized for pre-recorded processing
    const deepgramConfig = {
      model: 'nova-3-medical',
      punctuate: true,
      smart_format: true,
      redact: ['name_given', 'name_family'],
      diarize: false, // Disable speaker diarization
      paragraphs: true, // Keep paragraphs for better formatting
      utterances: true, // Enable word-level data with timestamps & confidence
      profanity_filter: false, // Medical context may include profanity in symptoms/conditions
      filler_words: false, // Remove "um", "uh", etc. for cleaner clinical notes
    };

    try {
 console.log('[Transcribe] model=', deepgramConfig.model);
} catch {}

    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      deepgramConfig,
    );
    const dgMs = Date.now() - dgStart;

    if (error) {
      try {
        if (debugEnabled) console.error('[Transcribe][dg:error]', { reqId, dgMs, error });
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

    // 🆕 UPDATED: Extract words from utterances (preferred) or alternatives fallback
    const utterances = result?.results?.utterances || [];
    const words = utterances.length > 0
      ? utterances.flatMap((utterance: any) => utterance.words || [])
      : (alt?.words || []);
    if (debugEnabled) {
      try {
        const duration = Number(result?.metadata?.duration || 0);
        console.log('[Transcribe][dg:ok]', { reqId, dgMs, duration, transcriptLen: (alt?.transcript || '').length, words: words.length, utterances: utterances.length, confidence });
      } catch {}
    }

    // If not persisting (desktop), increment per-session duration counter and return
    if (!persist) {
      try {
        const userId = context.userId;
        if (userId) {
          let currentSessionId: string | null = null;
          try {
            const current = await db
              .select({ currentSessionId: users.currentSessionId })
              .from(users)
              .where(eq(users.id, userId))
              .limit(1);
            currentSessionId = current?.[0]?.currentSessionId || null;
          } catch {}

          if (currentSessionId) {
            const incrementBy = Math.max(0, Math.round(Number(metadata?.duration || 0)));
            if (incrementBy > 0) {
              await db
                .update(patientSessions)
                .set({
                  deepgramDurationSec: sql`${patientSessions.deepgramDurationSec} + ${incrementBy}` as unknown as number,
                  updatedAt: new Date(),
                } as any)
                .where(and(eq(patientSessions.id, currentSessionId), eq(patientSessions.userId, userId)));
            }
          }
        }
      } catch {}
      const apiResponse = {
        transcript, // return plain transcript
        paragraphs,
        metadata,
        // legacy fields retained but clients may ignore
        confidence,
        words,
      } as any;
      if (debugEnabled) {
        try {
          console.log('[Transcribe][resp:non-persist]', { reqId, transcriptLen: (transcript || '').length });
        } catch {}
      }
      return NextResponse.json(apiResponse);
    }

    // Persist mode: append chunk to user's current session and signal desktop
    const userId = context.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Ensure a current session exists for the user
    let currentSessionId: string | null = null;
    // Ensure users row exists to satisfy FK constraints
    try {
      await db
        .insert(users)
        .values({ id: userId })
        .onConflictDoNothing();
    } catch {}
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
      if (debugEnabled) {
        try { console.log('[Transcribe][session:new]', { reqId, sessionId: currentSessionId }); } catch {}
      }
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
      if (debugEnabled) {
        try { console.log('[Transcribe][persist:skip-empty]', { reqId, sessionId: currentSessionId }); } catch {}
      }
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
    if (debugEnabled) {
      try { console.log('[Transcribe][persist:ok]', { reqId, sessionId: currentSessionId, chunkId, textLen: newEntry.text.length, durationSec: newEntry.durationSec }); } catch {}
    }

    // Aggregate Deepgram cost per session by summing durations and upserting single row
    try {
      const totalDurationSec = updatedTranscriptions.reduce((sum: number, entry: any) => {
        const d = Number(entry?.durationSec || 0);
        return sum + (Number.isFinite(d) ? d : 0);
      }, 0);
      const totalMinutes = totalDurationSec / 60;

      const breakdown = calculateDeepgramCost({ duration: totalMinutes } as any);

      try {
        await db.delete(apiUsageCosts).where(
          and(
            eq(apiUsageCosts.sessionId, currentSessionId),
            eq(apiUsageCosts.apiProvider, 'deepgram'),
            eq(apiUsageCosts.apiFunction, 'transcription'),
          ),
        );
      } catch {}

      await db.insert(apiUsageCosts).values({
        userId,
        sessionId: currentSessionId,
        apiProvider: 'deepgram',
        apiFunction: 'transcription',
        usageMetrics: { duration: totalMinutes },
        costUsd: breakdown.costUsd.toString(),
      } as any);
    } catch {}

    // Signal desktop via Ably (best-effort). Ensure single publish per chunk with helpful logs.
    try {
      if (((globalThis as any).process?.env?.ABLY_API_KEY)) {
        const ably = new Ably.Rest({ key: ((globalThis as any).process?.env?.ABLY_API_KEY) as string });
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
    try {
      if (((globalThis as any).process?.env?.DEBUG_TRANSCRIBE) === '1') console.error('[Transcribe][fatal]', { err: err?.message || String(err) });
    } catch {}
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
