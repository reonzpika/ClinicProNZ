import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { getAuth } from '@/shared/services/auth/clerk';
import { EXTRACT_FROM_EXAMPLE_PROMPT } from '@/features/templates/utils/aiPrompts';
import { validateTemplateDSL } from '@/features/templates/utils/validation';
import type { TemplateDSL } from '@/features/templates/types';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY');
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { userId } = await getAuth();
    if (!userId) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'You must be logged in to extract templates from examples' },
        { status: 401 },
      );
    }

    const { exampleNotes, additionalInstructions } = await req.json();

    if (!exampleNotes || exampleNotes.trim() === '') {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: 'Example consultation notes are required' },
        { status: 400 },
      );
    }

    // Prepare the user prompt with example notes and optional instructions
    let userPrompt = `CONSULTATION NOTES TO ANALYZE:
${exampleNotes}`;

    if (additionalInstructions && additionalInstructions.trim() !== '') {
      userPrompt += `

ADDITIONAL INSTRUCTIONS:
${additionalInstructions}`;
    }

    // Call OpenAI to extract template structure
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: EXTRACT_FROM_EXAMPLE_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_completion_tokens: 2000,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      return NextResponse.json(
        { code: 'AI_ERROR', message: 'No response from AI service' },
        { status: 500 },
      );
    }

    // Parse the JSON response
    let dsl: TemplateDSL;
    try {
      dsl = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      return NextResponse.json(
        { code: 'AI_ERROR', message: 'AI returned invalid JSON format' },
        { status: 500 },
      );
    }

    // Validate the extracted DSL
    const validation = validateTemplateDSL(dsl);
    if (!validation.isValid) {
      console.error('Invalid DSL extracted:', validation.errors);
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Extracted template structure is invalid', errors: validation.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ dsl });
  } catch (error) {
    console.error('Template extraction error:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Failed to extract template from example' },
      { status: 500 },
    );
  }
} 