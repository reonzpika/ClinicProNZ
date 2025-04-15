import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

import { NOTE_TEMPLATES } from '@/config/noteTemplates';
import type { NoteTemplate } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function generatePrompt(
  transcript: string,
  template: NoteTemplate,
  concisePrompt: string,
) {
  return `As a medical scribe, structure the following consultation transcript into a ${template.name} format.

${concisePrompt}

Template sections:
${template.structure.sections.map(section =>
    `${section.label}:
    ${section.prompt}`,
  ).join('\n\n')}

Consultation Transcript:
${transcript}

Respond in JSON format:
{
  "sections": [
    {
      "key": "section_key",
      "content": "section content"
    }
  ]
}`;
}

export async function POST(request: Request) {
  try {
    const { transcript, templateId, concisePrompt } = await request.json();
    const template = NOTE_TEMPLATES.find(t => t.id === templateId);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 400 },
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'o3-mini',
      messages: [
        {
          role: 'system',
          content: generatePrompt(transcript, template, concisePrompt),
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from GPT');
    }

    const response = JSON.parse(content);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Note generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate notes' },
      { status: 500 },
    );
  }
}
