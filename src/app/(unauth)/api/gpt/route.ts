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
            content: 'You are an AI assistant integrated into a healthcare SaaS platform to support General Practitioners during patient consultations. Your role is to provide concise and factual responses to enhance the efficiency of the consultation process. Deliver responses directly, without introductory or concluding remarks, focusing solely on the information requested. It\'s crucial to stay grounded in verifiable facts and avoid fabricating information. If you encounter a query where you lack sufficient data to provide a complete response, suggest additional information that the GP might consider. Always prioritize clarity and brevity in your communication, acknowledging the time-sensitive environment of medical consultations. Handle any potential inaccuracies by clearly stating uncertainties and suggesting verification where necessary.',
          },
          {
            role: 'user',
            content: `GP Query: ${prompt}\n\nPatient Summary:\n${patientSummary}`,
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
