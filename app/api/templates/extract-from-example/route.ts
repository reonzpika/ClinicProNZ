import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import type { TemplateDSL } from '@/features/templates/types';
import { EXTRACT_FROM_EXAMPLE_PROMPT } from '@/features/templates/utils/aiPrompts';
import { validateTemplateDSL } from '@/features/templates/utils/validation';
import { getAuth } from '@/shared/services/auth/clerk';

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

    const { examples, additionalInstructions } = await req.json();

    if (!examples || !Array.isArray(examples) || examples.length === 0) {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: 'At least one example consultation note is required' },
        { status: 400 },
      );
    }

    // Filter out empty examples
    const validExamples = examples.filter((example: string) => example && example.trim() !== '');

    if (validExamples.length === 0) {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: 'At least one non-empty example consultation note is required' },
        { status: 400 },
      );
    }

    // Prepare the user prompt with multiple examples
    let userPrompt = `CONSULTATION NOTES TO ANALYZE:

${validExamples.map((example: string, index: number) =>
  `EXAMPLE ${index + 1}:
${example}

`).join('')}`;

    if (additionalInstructions && additionalInstructions.trim() !== '') {
      userPrompt += `ADDITIONAL INSTRUCTIONS:
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
    let parsedResponse: any;
    try {
      parsedResponse = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      return NextResponse.json(
        { code: 'AI_ERROR', message: 'AI returned invalid JSON format' },
        { status: 500 },
      );
    }

    // Extract DSL and metadata from the response
    let dsl: TemplateDSL;
    let title: string;
    let description: string;

    if (parsedResponse.dsl && parsedResponse.title && parsedResponse.description) {
      // New format with metadata
      dsl = parsedResponse.dsl;
      title = parsedResponse.title;
      description = parsedResponse.description;
    } else if (parsedResponse.sections) {
      // Legacy format - just DSL
      dsl = parsedResponse;
      title = `Template from ${validExamples.length} Example${validExamples.length > 1 ? 's' : ''}`;
      description = `Template extracted from ${validExamples.length} consultation note example${validExamples.length > 1 ? 's' : ''}, preserving the GP's documentation style and structure.`;
    } else {
      return NextResponse.json(
        { code: 'AI_ERROR', message: 'AI response missing required fields' },
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

    return NextResponse.json({
      dsl,
      title,
      description,
    });
  } catch (error) {
    console.error('Template extraction error:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Failed to extract template from examples' },
      { status: 500 },
    );
  }
}
