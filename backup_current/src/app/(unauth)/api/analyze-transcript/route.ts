import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const analyzeTranscript = `
As an experienced GP, analyze this consultation transcript and identify key clinical points. Focus on:

1. Patient Agenda:
   - List all patient complaints and requests
   - Include symptoms, medication requests, certificates, or any other needs
   - Indicate if urgent priority
   - Categorize as: 'symptom', 'request', or 'other'
   - Keep descriptions very concise

2. Red Flags:
   - Identify concerning symptoms/signs
   - Brief clinical reasoning
   - Urgency level (immediate = requires immediate action, urgent = needs attention today)
   - Keep descriptions very concise

3. Significant Points:
   - Past Medical History (if mentioned)
   - Allergies (if mentioned)
   - Any other clinically significant information
   - Keep only points that might impact clinical decisions
   - Keep descriptions very concise

Format response as JSON:
{
  "patientAgenda": [{
    "description": string,
    "priority": "urgent" | "routine",
    "type": "symptom" | "request" | "other"
  }],
  "redFlags": [{
    "symptom": string,
    "reasoning": string,
    "urgency": "immediate" | "urgent"
  }],
  "significantPoints": [{
    "type": "pmhx" | "allergy" | "social" | "family" | "other",
    "description": string
  }]
}

Keep all descriptions concise and clinically focused. Use minimal words while maintaining clarity.
`;

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json();

    if (!transcript || transcript.trim().length < 5) {
      return NextResponse.json({
        patientAgenda: [],
        redFlags: [],
        significantPoints: [],
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'o3-mini',
      messages: [
        { role: 'system', content: analyzeTranscript },
        { role: 'user', content: transcript },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from GPT');
    }

    const response = JSON.parse(content);

    // Validate response structure
    if (!response.patientAgenda || !response.redFlags || !response.significantPoints) {
      throw new Error('Invalid response format from GPT');
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Transcript analysis error:', error);
    return NextResponse.json({
      patientAgenda: [],
      redFlags: [],
      significantPoints: [],
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
