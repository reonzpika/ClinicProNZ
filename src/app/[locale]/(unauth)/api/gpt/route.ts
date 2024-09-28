import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { prompt, patientSummary } = await request.json();

  try {
    const API_KEY = process.env.OPENAI_API_KEY;
    const API_ENDPOINT = process.env.NEXT_PUBLIC_GPT_API_ENDPOINT;

    if (!API_KEY || !API_ENDPOINT) {
      throw new Error('API key or endpoint is not set');
    }

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that provides medical consultation suggestions.',
          },
          {
            role: 'user',
            content: `${prompt}: ${patientSummary}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get AI assistance: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json({ content: data.choices[0].message.content });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}