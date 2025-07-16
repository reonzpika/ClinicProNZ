import { Buffer } from 'node:buffer';

import { createClient } from '@deepgram/sdk';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

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

    // Convert file (Blob) to Buffer
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

    // Log the full Deepgram response for debugging
    console.error('[Deepgram Full Response]', JSON.stringify(result, null, 2));

    // Extract transcript, paragraphs, metadata
    const alt = result?.results?.channels?.[0]?.alternatives?.[0];
    const transcript = alt?.transcript || '';
    const paragraphs = alt?.paragraphs || [];
    const metadata = result?.metadata || {};

    // Diarization: use Deepgram's built-in paragraphs.transcript if available
    let diarizedTranscript = '';
    if (alt?.paragraphs && typeof alt.paragraphs === 'object' && typeof alt.paragraphs.transcript === 'string') {
      diarizedTranscript = alt.paragraphs.transcript;
    } else if (alt?.words && Array.isArray(alt.words)) {
      // Fallback: manual grouping (should rarely be needed)
      let currentSpeaker = null;
      let currentParagraph = [];
      const paragraphsArr = [];
      for (const wordObj of alt.words) {
        if (wordObj.speaker !== currentSpeaker) {
          if (currentParagraph.length > 0) {
            paragraphsArr.push({
              speaker: currentSpeaker,
              text: currentParagraph.join(' '),
            });
            currentParagraph = [];
          }
          currentSpeaker = wordObj.speaker;
        }
        currentParagraph.push(wordObj.word);
      }
      if (currentParagraph.length > 0) {
        paragraphsArr.push({
          speaker: currentSpeaker,
          text: currentParagraph.join(' '),
        });
      }
      diarizedTranscript = paragraphsArr
        .map(p => `Speaker ${p.speaker}: ${p.text}`)
        .join('\n\n');
    }

    return NextResponse.json({ transcript, paragraphs, metadata, diarizedTranscript });
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
