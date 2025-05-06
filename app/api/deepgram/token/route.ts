import { NextResponse } from 'next/server';

if (!process.env.DEEPGRAM_API_KEY) {
  throw new Error('DEEPGRAM_API_KEY is not set in environment variables');
}

export async function GET() {
  try {
    // For live streaming, we use the API key directly
    return NextResponse.json({ token: process.env.DEEPGRAM_API_KEY });
  } catch (error) {
    console.error('Error getting Deepgram API key:', error);
    return NextResponse.json(
      { error: 'Failed to get API key' },
      { status: 500 },
    );
  }
}
