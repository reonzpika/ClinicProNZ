import { Buffer } from 'node:buffer';

import { createClient } from '@deepgram/sdk';
import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/client';
import { recordingTokens } from '@/schema';

export const runtime = 'nodejs';

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '100mb',
  },
};

export async function POST(req: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('audio');
    const sessionId = formData.get('sessionId') as string;
    const token = formData.get('token') as string;

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No audio file uploaded' }, { status: 400 });
    }

    if (!sessionId || !token) {
      return NextResponse.json({ error: 'Session ID and token are required' }, { status: 400 });
    }

    // Validate token
    const tokenRecord = await db
      .select()
      .from(recordingTokens)
      .where(
        and(
          eq(recordingTokens.token, token),
          eq(recordingTokens.sessionId, sessionId),
        ),
      )
      .limit(1);

    if (tokenRecord.length === 0) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const record = tokenRecord[0]!; // Non-null assertion since we checked length above

    // Check if token has expired
    if (new Date() > record.expiresAt) {
      return NextResponse.json({ error: 'Token has expired' }, { status: 401 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // Initialize Deepgram client
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

    // Transcribe the audio file
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: 'nova-3',
        punctuate: true,
        language: 'en-NZ',
        smart_format: true,
        redact: ['name_given', 'name_family'],
        diarize: true,
        filler_words: true,
        paragraphs: true,
        utterances: false,
      },
    );

    if (error) {
      console.error('Deepgram transcription error:', error);
      return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
    }

    // Extract transcript
    const alt = result?.results?.channels?.[0]?.alternatives?.[0];
    const transcript = alt?.transcript || '';
    const paragraphs = alt?.paragraphs || [];
    const metadata = result?.metadata || {};

    if (transcript && transcript.trim()) {
      // Mark token as used (optional)
      await db
        .update(recordingTokens)
        .set({ isUsed: true, updatedAt: new Date() })
        .where(eq(recordingTokens.id, record.id));

      // Trigger immediate sync to desktop session
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/recording/sync-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: record.sessionId,
            transcript: transcript.trim(),
            source: 'mobile',
          }),
        });
      } catch (syncError) {
        console.error('Failed to trigger desktop sync:', syncError);
        // Don't fail the entire request if sync fails
      }

      return NextResponse.json({
        transcript,
        paragraphs,
        metadata,
        sessionId: record.sessionId,
        success: true,
      });
    }

    return NextResponse.json({
      transcript,
      paragraphs,
      metadata,
      sessionId: record.sessionId,
      success: true,
    });
  } catch (err: any) {
    console.error('Mobile upload error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
