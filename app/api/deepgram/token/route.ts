import { NextResponse } from 'next/server';

if (!process.env.DEEPGRAM_API_KEY) {
  throw new Error('DEEPGRAM_API_KEY is not set in environment variables');
}

export async function GET() {
  try {
    // Generate a real Deepgram JWT token
    const response = await fetch('https://api.deepgram.com/v1/auth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      // Optionally, you can specify scopes or TTL here
      // body: JSON.stringify({ scopes: ['listen:stream'], time_to_live: 60 }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to get Deepgram JWT token:', error);
      return NextResponse.json(
        { code: 'INTERNAL_ERROR', message: 'Failed to get Deepgram JWT token' },
        { status: 500 },
      );
    }

    const data = await response.json();
    return NextResponse.json({ token: data.token });
  } catch (error) {
    console.error('Error getting Deepgram JWT token:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to get Deepgram JWT token' },
      { status: 500 },
    );
  }
}
