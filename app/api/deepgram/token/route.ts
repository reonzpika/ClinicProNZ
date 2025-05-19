import { NextResponse } from 'next/server';

if (!process.env.DEEPGRAM_API_KEY) {
  throw new Error('DEEPGRAM_API_KEY is not set in environment variables');
}

export async function GET() {
  try {
    // Request a temporary Deepgram token (JWT) for browser use
    const response = await fetch('https://api.deepgram.com/v1/auth/grant', {
      method: 'POST',
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to get Deepgram temporary token');
    }
    const data = await response.json();
    return NextResponse.json({ token: data.access_token });
  } catch (error) {
    console.error('Error getting Deepgram temporary token:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to get Deepgram token' },
      { status: 500 },
    );
  }
}
