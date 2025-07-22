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

      // Validate session ownership for guest users
      if (context.guestToken && session.guestToken !== context.guestToken) {
        return NextResponse.json({
          error: 'Access denied',
          message: 'Session does not belong to guest user',
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
      interim_results: true, // Enable interim results for better real-time processing
      endpointing: 500, // Time in ms to wait before considering utterance complete
    };
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      deepgramConfig,
    );

    if (error) {
      console.error('Deepgram transcription error:', error);
      return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
    }

    // Extract transcript, paragraphs, and metadata (no diarization data)
    const alt = result?.results?.channels?.[0]?.alternatives?.[0];
    const transcript = alt?.transcript || '';
    const paragraphs = alt?.paragraphs || [];
    const metadata = result?.metadata || {};

    const apiResponse = { transcript, paragraphs, metadata };
    return NextResponse.json(apiResponse);
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
