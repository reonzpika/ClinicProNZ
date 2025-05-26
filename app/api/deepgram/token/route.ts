import { NextResponse } from 'next/server';

// Force Node.js runtime
export const runtime = 'nodejs';

export async function POST() { // <-- POST method
  const apiKey = process.env.DEEPGRAM_API_KEY;
  const projectId = process.env.DEEPGRAM_PROJECT_ID;

  console.error('Deepgram API Key:', apiKey ? 'Found' : 'Missing');
  console.error('Deepgram Project ID:', projectId ? 'Found' : 'Missing');

  if (!apiKey || !projectId) {
    console.error('CONFIG_ERROR: Missing API key or project ID', {
      hasApiKey: !!apiKey,
      hasProjectId: !!projectId,
      nodeEnv: process.env.NODE_ENV,
    });
    return NextResponse.json(
      { code: 'CONFIG_ERROR', message: 'Missing Deepgram config' },
      { status: 500 },
    );
  }

  try {
    const url = `https://api.deepgram.com/v1/auth/grant`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.error('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FAILED_REQUEST: Failed to get token from Deepgram:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        headers: Object.fromEntries(response.headers.entries()),
      });
      return NextResponse.json(
        { code: 'INTERNAL_ERROR', message: 'Failed to get Deepgram token' },
        { status: 500 },
      );
    }

    const data = await response.json();

    console.error('Received token from Deepgram:', {
      success: !!data.access_token,
      tokenLength: data.access_token?.length,
    });

    return NextResponse.json({ token: data.access_token });
  } catch (error) {
    console.error('UNEXPECTED_ERROR: Exception occurred while getting token:', {
      error: error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error,
    });
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Unexpected error getting Deepgram token' },
      { status: 500 },
    );
  }
}
