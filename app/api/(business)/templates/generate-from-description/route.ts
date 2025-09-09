import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import type { TemplateGenerationResponse } from '@/src/features/templates/types';
import { getAuth } from '@/src/shared/services/auth/clerk';

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY');
  return new OpenAI({ apiKey });
}

const GENERATE_FROM_PROMPT_PROMPT = `You are an expert medical documentation assistant. Your task is to create natural language clinical note templates based on user descriptions.

TEMPLATE FORMAT:
- Use natural language with placeholders in square brackets: [description of what goes here]
- Include conditional instructions in parentheses: (only include if explicitly mentioned)
- Follow this structure pattern:

(Brief instructional preamble explaining the template purpose and rules)

SECTION 1:
- [Placeholder description] (conditional instructions)
- [Another placeholder] (conditional instructions)

SECTION 2:
- [Placeholder description] (conditional instructions)

(Final instructions about not generating information not in source data)

EXAMPLE OUTPUT:
{
  "title": "Dermatology Consultation",
  "description": "Template for dermatology consultations with detailed skin examination",
  "templateBody": "(This template is for dermatology consultations. Only include information explicitly mentioned in the consultation data.)\\n\\nHISTORY:\\n- [Chief complaint and skin concerns] (only include if explicitly mentioned)\\n- [Duration and progression of skin condition] (only include if explicitly mentioned)\\n- [Previous treatments tried] (only include if explicitly mentioned)\\n\\nEXAMINATION:\\n- [Skin examination findings including location, appearance, size] (only include if explicitly mentioned)\\n- [Distribution pattern] (only include if explicitly mentioned)\\n\\nASSESSMENT:\\n- [Clinical diagnosis] (only include if explicitly mentioned)\\n\\nPLAN:\\n- [Treatment recommendations] (only include if explicitly mentioned)\\n- [Follow-up plan] (only include if explicitly mentioned)\\n\\n(Never generate clinical information not explicitly mentioned in the consultation data.)"
}

CRITICAL RULES:
- Always include "(only include if explicitly mentioned)" for clinical content
- Include strong anti-hallucination instructions at the end
- Use \\n for line breaks in templateBody
- Make placeholders descriptive and specific to the medical specialty
- Include appropriate medical sections for the described use case

Generate a JSON response with title, description, and templateBody fields.`;

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { code: 'CONFIG_ERROR', message: 'Missing OPENAI_API_KEY' },
        { status: 500 },
      );
    }
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

    // Build user prompt
    const userPrompt = `Create a clinical note template for: ${description}${templateType ? `\n\nTemplate type: ${templateType}` : ''}`;

    // Call OpenAI to generate template structure
    const completion = await getOpenAI().chat.completions.create({
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
    let templateResponse: TemplateGenerationResponse;
    try {
      templateResponse = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      return NextResponse.json(
        { code: 'AI_ERROR', message: 'AI returned invalid JSON format' },
        { status: 500 },
      );
    }

    // Validate the response structure
    if (!templateResponse.title || !templateResponse.description || !templateResponse.templateBody) {
      return NextResponse.json(
        { code: 'AI_ERROR', message: 'AI response missing required fields (title, description, or templateBody)' },
        { status: 500 },
      );
    }

    return NextResponse.json(templateResponse);
  } catch (error) {
    console.error('Template generation error:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Failed to generate template' },
      { status: 500 },
    );
  }
}
