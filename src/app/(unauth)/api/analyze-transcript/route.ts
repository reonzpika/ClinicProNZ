import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

import type { ClinicalFinding } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ANALYSIS_PROMPT = `You are a clinical analysis assistant for a GP in New Zealand. 
Analyze the following consultation transcript in real-time and extract key clinical findings.
You must respond with valid JSON format.
Format your response EXACTLY as follows:
{
  "findings": [
    {
      "type": "symptom"|"duration"|"risk"|"vital"|"medication",
      "text": "extracted text",
      "importance": "high"|"medium"|"low",
      "timestamp": UNIX_TIMESTAMP
    }
  ]
}

Focus on:
1. Key symptoms and their duration
2. Risk factors
3. Vital signs
4. Medications mentioned
5. Critical clinical patterns

Remember to return only valid JSON.
Transcript:`;

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json();

    if (!transcript || transcript.trim().length < 5) {
      return NextResponse.json({ findings: [] });
    }

    const completion = await openai.chat.completions.create({
      model: 'o3-mini',
      messages: [
        { role: 'system', content: ANALYSIS_PROMPT },
        { role: 'user', content: transcript },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from GPT');
    }

    const response = JSON.parse(content);
    if (!response.findings || !Array.isArray(response.findings)) {
      throw new Error('Invalid response format from GPT');
    }

    const findings = response.findings.map((finding: ClinicalFinding) => ({
      ...finding,
      timestamp: finding.timestamp || Date.now(),
    }));

    return NextResponse.json({ findings });
  } catch (error) {
    console.error('Transcript analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json(
      { error: errorMessage, findings: [] },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
