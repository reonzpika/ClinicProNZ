import { Buffer } from 'node:buffer';

import { createClient } from '@deepgram/sdk';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { patientSessions } from '@/db/schema';
import { checkCoreSessionLimit, extractRBACContext } from '@/src/lib/rbac-enforcer';

export const runtime = 'nodejs'; // Ensure Node.js runtime for Buffer support

export const config = {
  api: {
    bodyParser: false, // Required for formidable to handle multipart
    sizeLimit: '100mb',
  },
};

export async function POST(req: NextRequest) {
  try {
    // Extract RBAC context and check permissions
    const context = await extractRBACContext(req);
    const permissionCheck = await checkCoreSessionLimit(context);

    if (!permissionCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: permissionCheck.reason || 'Access denied',
          message: permissionCheck.upgradePrompt || 'Insufficient permissions',
          remaining: permissionCheck.remaining,
          resetTime: permissionCheck.resetTime?.toISOString(),
        }),
        {
          status: permissionCheck.reason?.includes('limit') ? 429 : 403,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Parse multipart form data using Web API
    const formData = await req.formData();
    const file = formData.get('audio');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No audio file uploaded' }, { status: 400 });
    }

    // Phase 3: Session validation for transcript chunks
    const sessionId = formData.get('sessionId') as string;
    if (sessionId) {
      // Validate that the session exists and is active
      const sessionRecords = await db
        .select()
        .from(patientSessions)
        .where(eq(patientSessions.id, sessionId))
        .limit(1);

    if (sessionRecords.length === 0) {
      return NextResponse.json({
        error: 'Invalid session',
        message: 'Session not found',
      }, { status: 400 });
    }

      const session = sessionRecords[0];
    if (session?.status !== 'active') {
      return NextResponse.json({
        error: 'Invalid session',
        message: 'Session is not active',
      }, { status: 400 });
    }

      // Validate session ownership for authenticated users
    if (context.userId && session.userId !== context.userId) {
      return NextResponse.json({
        error: 'Access denied',
        message: 'Session does not belong to user',
      }, { status: 403 });
    }
    }

    // Convert file (Blob) to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // Initialize Deepgram client
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

    // Transcribe the audio file
    const deepgramConfig = {
      model: 'nova-3',
      punctuate: true,
      language: 'en-NZ',
      smart_format: true,
      redact: ['name_given', 'name_family'],
      diarize: false, // Disable speaker diarization
      paragraphs: true, // Keep paragraphs for better formatting
      utterances: true, // 🆕 REQUIRED: Enable word-level data with timestamps & confidence
      interim_results: true,
      endpointing: 500,
    };
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      deepgramConfig,
    );

    if (error) {
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

    // Append transcript to Neon when a sessionId is provided and valid
    try {
      if (sessionId && transcript && transcript.trim()) {
        const existingSession = await db
          .select()
          .from(patientSessions)
          .where(eq(patientSessions.id, sessionId))
          .limit(1);
        if (existingSession.length > 0) {
          const prev = existingSession[0]?.transcriptions ? JSON.parse(existingSession[0].transcriptions as any) : [];
          const entry = { id: Date.now().toString(), text: transcript, timestamp: new Date().toISOString(), source: 'mobile', deviceId: 'phone' };
          const updatedArr = Array.isArray(prev) ? [...prev, entry] : [entry];
          await db
            .update(patientSessions)
            .set({ transcriptions: JSON.stringify(updatedArr), updatedAt: new Date() })
            .where(eq(patientSessions.id, sessionId));
        }
      }
    } catch {
      // best-effort only; UI still receives transcript
    }

    // ENHANCED: Return all data (existing + new fields for enhanced features)
    const apiResponse = {
      transcript, // ✅ Existing consumers still work
      paragraphs, // ✅ Existing consumers still work
      metadata, // ✅ Existing consumers still work
      confidence, // 🆕 New field (ignored by existing code)
      words, // 🆕 New field (ignored by existing code)
    };

    return NextResponse.json(apiResponse);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
