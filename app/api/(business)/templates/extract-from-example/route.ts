import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import type { TemplateGenerationResponse } from '@/src/features/templates/types';
import { getAuth } from '@/src/shared/services/auth/clerk';

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }
  return new OpenAI({ apiKey });
}

const EXTRACT_FROM_EXAMPLE_PROMPT = `You are an expert medical documentation assistant. Your task is to analyse example clinical notes and create a reusable natural language template that captures their structure and style.

TEMPLATE FORMAT:
- Use natural language with placeholders in square brackets: [description of what goes here]
- Include conditional instructions in parentheses: (only include if explicitly mentioned)
- Preserve the documentation style and section headings from the examples
- Follow this structure pattern:

(Brief instructional preamble explaining the template purpose and rules)

SECTION_NAME_FROM_EXAMPLES:
- [Placeholder description based on example content] (conditional instructions)
- [Another placeholder] (conditional instructions)

ANOTHER_SECTION_FROM_EXAMPLES:
- [Placeholder description] (conditional instructions)

(Final instructions about not generating information not in source data)

ANALYSIS PROCESS:
1. Identify common section headings and structure across examples
2. Determine the documentation style (abbreviations, format, etc.)
3. Create placeholders that capture the type of information in each section
4. Preserve the clinical workflow evident in the examples

EXAMPLE OUTPUT:
{
  "title": "GP Consultation Note",
  "description": "Template based on provided consultation note examples",
  "templateBody": "(This template follows your documentation style. Only include information explicitly mentioned in the consultation data.)\\n\\nS//\\n- [Patient's presenting complaint and history] (only include if explicitly mentioned)\\n- [Relevant past medical history] (only include if explicitly mentioned)\\n\\nO//\\n- [Vital signs and examination findings] (only include if explicitly mentioned)\\n\\nA//\\n- [Clinical assessment and diagnosis] (only include if explicitly mentioned)\\n\\nP//\\n- [Treatment plan and follow-up] (only include if explicitly mentioned)\\n\\n(Never generate clinical information not explicitly mentioned in the consultation data.)"
}

CRITICAL RULES:
- Preserve the exact section headings and abbreviations from examples
- Always include "(only include if explicitly mentioned)" for clinical content
- Include strong anti-hallucination instructions at the end
- Use \\n for line breaks in templateBody
- Match the documentation style and format of the examples
- Create placeholders that reflect the specific content types seen in examples

Generate a JSON response with title, description, and templateBody fields.`;

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

    // Build user prompt
    let userPrompt = 'EXAMPLE CLINICAL NOTES:\n\n';
    validExamples.forEach((example: string, index: number) => {
      userPrompt += `Example ${index + 1}:\n${example}\n\n`;
    });

    if (additionalInstructions) {
      userPrompt += `ADDITIONAL INSTRUCTIONS:\n${additionalInstructions}\n\n`;
    }

    userPrompt += 'Create a template that captures the structure and style of these examples.';

    // Call OpenAI to extract template structure
    const openai = getOpenAI();
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
    console.error('Template extraction error:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Failed to extract template from examples' },
      { status: 500 },
    );
  }
}
