import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import { createClient } from '@deepgram/sdk';

export const config = {
  api: {
    bodyParser: false, // Required for formidable to handle multipart
    sizeLimit: '100mb',
  },
};

// Helper to parse multipart form data
async function parseForm(req: NextRequest): Promise<{ audio: Buffer; filename: string }> {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });
    form.parse(req as any, (err, fields, files) => {
      if (err) return reject(err);
      const file = files.audio;
      if (!file) return reject(new Error('No audio file uploaded'));
      const f = Array.isArray(file) ? file[0] : file;
      fs.readFile(f.filepath, (err, data) => {
        if (err) return reject(err);
        resolve({ audio: data, filename: f.originalFilename || 'audio.webm' });
      });
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    // Parse the uploaded audio file
    const { audio, filename } = await parseForm(req);

    // Initialize Deepgram client
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

    // Transcribe the audio file
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audio,
      {
        model: 'nova-3',
        punctuate: true,
        language: 'en-NZ',
        smart_format: true,
        redaction: { type: 'pii' },
        diarize: true,
        paragraphs: true,
        utterances: true,
      }
    );

    if (error) {
      console.error('Deepgram transcription error:', error);
      return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
    }

    // Log the full Deepgram response for debugging
    console.log('[Deepgram Full Response]', JSON.stringify(result, null, 2));

    // Extract transcript, paragraphs, metadata
    const alt = result?.results?.channels?.[0]?.alternatives?.[0];
    const transcript = alt?.transcript || '';
    const paragraphs = alt?.paragraphs || [];
    const metadata = result?.metadata || {};

    return NextResponse.json({ transcript, paragraphs, metadata });
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
} 