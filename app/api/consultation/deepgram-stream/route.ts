import { NextRequest } from 'next/server';
import { createClient } from '@deepgram/sdk';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // Get Deepgram API key from server env
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return new Response('Missing Deepgram API key', { status: 500 });
  }

  // Create Deepgram client
  const deepgram = createClient(apiKey);

  // Get audio data from request
  const audioBuffer = Buffer.from(await req.arrayBuffer());

  // Create a promise to handle transcription
  return new Promise(async (resolve) => {
    // Start Deepgram live transcription
    const connection = deepgram.listen.live({
      model: 'nova-2',
      language: 'en-NZ',
      smart_format: true,
      interim_results: true,
      punctuate: true,
      diarize: true,
      utterances: true,
      vad_events: true,
      encoding: 'linear16',
      sample_rate: 16000,
      channels: 1,
    });

    let transcript = '';

    connection.on('transcriptReceived', (data: any) => {
      const t = data.channel.alternatives[0]?.transcript;
      if (t) transcript += t + ' ';
    });

    connection.on('close', () => {
      resolve(new Response(JSON.stringify({ transcript }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));
    });

    connection.on('error', (err: any) => {
      resolve(new Response(JSON.stringify({ error: err.message }), { status: 500 }));
    });

    // Send audio data and finish
    await connection.send(audioBuffer);
    await connection.finish();
  });
} 