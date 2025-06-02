import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { getAuth } from '@/shared/services/auth/clerk';
import { GENERATE_FROM_PROMPT_PROMPT } from '@/features/templates/utils/aiPrompts';
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
        { code: 'UNAUTHORIZED', message: 'You must be logged in to generate templates from descriptions' },
        { status: 401 },
      );
    }

    const { description, templateType } = await req.json();

    if (!description || description.trim() === '') {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: 'Template description is required' },
        { status: 400 },
      );
    }

    // Prepare the user prompt with description and optional template type
    let userPrompt = `TEMPLATE DESCRIPTION:
${description}`;

    if (templateType && templateType.trim() !== '') {
      userPrompt += `

TEMPLATE TYPE: ${templateType}`;
    }

    // Call OpenAI to generate template structure
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: GENERATE_FROM_PROMPT_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
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

    // Validate the generated DSL
    const validation = validateTemplateDSL(dsl);
    if (!validation.isValid) {
      console.error('Invalid DSL generated:', validation.errors);
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Generated template structure is invalid', errors: validation.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ dsl });
  } catch (error) {
    console.error('Template generation error:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Failed to generate template from description' },
      { status: 500 },
    );
  }
} 