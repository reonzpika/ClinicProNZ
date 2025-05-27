import { NextResponse } from 'next/server';

// Force Node.js runtime
export const runtime = 'nodejs';

export async function POST() {
  const API_KEY = process.env.DEEPGRAM_API_KEY;
  if (!API_KEY) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const grantBody = {
    type: 'live',
  };

  try {
    const res = await fetch('https://api.deepgram.com/v1/auth/grant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${API_KEY}`,
      },
      body: JSON.stringify(grantBody),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Deepgram grant failed:', res.status, text);
      return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
    }

    const { access_token: token, expires_in } = await res.json();
    return NextResponse.json({ token, expires_in });
  } catch (err) {
    console.error('Token grant exception', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
