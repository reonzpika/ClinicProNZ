import type { TemplateDSL } from '@/features/templates/types';

import { generateInstructions } from './instructionMappings';
import { SYSTEM_PROMPT } from './systemPrompt';

// Helper function to build consultation data section dynamically
function buildConsultationData(
  transcription: string,
  quickNotes: string[],
  typedInput?: string,
  inputMode: 'audio' | 'typed' = 'audio',
): string {
  const sections: string[] = [];

  if (inputMode === 'audio') {
    // Add transcription if available
    if (transcription && transcription.trim()) {
      sections.push('[TRANSCRIPTION]');
      sections.push(transcription.trim());
    }

    // Add quick notes if available
    if (quickNotes.length > 0) {
      const quickNotesText = quickNotes.join('\n').trim();
      if (quickNotesText) {
        sections.push('[QUICKNOTES]');
        sections.push(quickNotesText);
      }
    }
  } else if (inputMode === 'typed') {
    // Add typed input if available
    if (typedInput && typedInput.trim()) {
      sections.push('[TYPED_INPUT]');
      sections.push(typedInput.trim());
    }
  }

  return sections.length > 0 ? sections.join('\n\n') : '';
}

export function compileTemplate(
  dsl: TemplateDSL,
  transcription: string,
  quickNotes: string[],
  typedInput?: string,
  inputMode: 'audio' | 'typed' = 'audio',
): { system: string; user: string } {
  // Generate instructions from template settings
  const instructions = generateInstructions(dsl.settings);

  // Prepare template structure (JSON format as specified)
  const templateStructure = JSON.stringify(dsl, null, 2);

  // Build consultation data dynamically
  const consultationData = buildConsultationData(transcription, quickNotes, typedInput, inputMode);

  // Build the complete user message
  const userMessageParts = [
    '--- TEMPLATE DEFINITION ---',
    templateStructure,
    '',
    '--- INSTRUCTIONS ---',
    instructions.analysisInstruction,
    instructions.optionalSectionsInstruction,
    instructions.detailInstruction,
    instructions.bulletInstruction,
    instructions.abbreviationInstruction,
    'Always add a blank line between each section in the generated note for proper spacing and readability.',
    'Use only plain text format - no markdown, HTML, or other formatting markup.',
    'Do not include any commentary, reasoning steps, or metadata—output only the final clinical note as structured above.',
    '',
    '--- CONSULTATION DATA ---',
    consultationData,
    '',
  ];

  const userMessage = userMessageParts.join('\n');

  return {
    system: SYSTEM_PROMPT,
    user: userMessage,
  };
}
