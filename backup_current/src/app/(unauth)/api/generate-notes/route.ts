import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { z } from 'zod';

import type { GeneratedNote } from '@/types/note-generation';
import { assemblePrompt, loadPromptConfig, loadTemplatePrompt, validatePrompt } from '@/utils/prompt-loader';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? '',
});

// Request validation schema
const requestSchema = z.object({
  transcript: z.string().min(1, 'Transcript is required'),
  templateId: z.string().min(1, 'Template ID is required'),
  analysisLevel: z.enum(['facts', 'basic', 'clinical'] as const),
  conciseLevel: z.enum(['detailed', 'concise', 'bullet-points'] as const),
});

export async function POST(req: Request) {
  try {
    // Parse and validate request
    const body = await req.json();
    const validatedData = requestSchema.parse(body);
    const { transcript, templateId, analysisLevel, conciseLevel } = validatedData;

    // Load and validate prompts
    const promptConfig = await loadPromptConfig();
    const templatePrompt = await loadTemplatePrompt(templateId);

    // Assemble final prompt
    const fullPromptConfig = {
      ...promptConfig,
      templatePrompt,
    };

    const prompt = assemblePrompt(
      fullPromptConfig,
      templateId,
      analysisLevel,
    );

    // Validate assembled prompt
    if (!validatePrompt(prompt)) {
      return NextResponse.json(
        { error: 'Invalid prompt structure' },
        { status: 400 },
      );
    }

    // Make API call to OpenAI
    const completion = await openai.chat.completions.create({
      model: 'o4-mini',
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
      temperature: 0.3, // Lower temperature for consistent medical notes
      response_format: { type: 'json_object' }, // Ensure JSON response
      max_tokens: 4000, // Adjust based on your needs
    });

    const generatedNote = completion.choices[0]?.message?.content;
    if (!generatedNote) {
      throw new Error('No content received from AI');
    }

    // Parse and validate the response
    try {
      const parsedNote = JSON.parse(generatedNote) as GeneratedNote;

      // Add metadata
      parsedNote.metadata = {
        templateType: templateId,
        analysisLevel,
        conciseLevel,
        generatedAt: new Date().toISOString(),
        templateId,
      };

      return NextResponse.json(parsedNote);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Note generation error:', error);

    // Handle different types of errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message.includes('Failed to load')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate notes' },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { previousNote, modifications } = await req.json();

    // Validate modifications
    const modSchema = z.object({
      analysisLevel: z.enum(['facts', 'basic', 'clinical'] as const).optional(),
      conciseLevel: z.enum(['detailed', 'concise', 'bullet-points'] as const).optional(),
    });

    const validatedMods = modSchema.parse(modifications);

    const completion = await openai.chat.completions.create({
      model: 'o4-mini',
      messages: [
        {
          role: 'system',
          content: `Modify the existing medical note according to these changes: ${JSON.stringify(validatedMods)}`,
        },
        {
          role: 'user',
          content: JSON.stringify(previousNote),
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
      max_tokens: 4000,
    });

    const modifiedNote = completion.choices[0]?.message?.content;
    if (!modifiedNote) {
      throw new Error('No content received from AI');
    }

    try {
      const parsedNote = JSON.parse(modifiedNote) as GeneratedNote;

      // Update metadata
      parsedNote.metadata = {
        ...previousNote.metadata,
        ...validatedMods,
        generatedAt: new Date().toISOString(),
      };

      return NextResponse.json(parsedNote);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Note modification error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid modification data', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to modify notes' },
      { status: 500 },
    );
  }
}
