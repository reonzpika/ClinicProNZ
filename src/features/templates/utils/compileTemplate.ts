import type { TemplateDSL } from '@/features/templates/types';

import {
  buildAiAnalysisInstructions,
  getProcessInstructions,
} from './instructionMapping';
// Import instruction mapping functions
import { generateSystemPrompt } from './systemPrompt';

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
  // Determine if AI analysis is enabled AND has components selected
  const aiAnalysisEnabled = dsl.settings?.aiAnalysis?.enabled ?? false;
  const hasAiComponents = (aiAnalysisEnabled
    && dsl.settings?.aiAnalysis?.components
    && Object.values(dsl.settings.aiAnalysis.components).some(enabled => enabled)) || false;

  // Build AI analysis instructions if needed
  let aiAnalysisInstructions: string | undefined;
  if (hasAiComponents && dsl.settings?.aiAnalysis?.components) {
    aiAnalysisInstructions = buildAiAnalysisInstructions(
      dsl.settings.aiAnalysis.components,
      dsl.settings.aiAnalysis.level || 'medium',
    );
  }

  // Generate base system prompt
  const systemPrompt = generateSystemPrompt();

  // Prepare template structure (JSON format as specified) - clinical content structure only
  const templateStructure = JSON.stringify({
    sections: dsl.sections.map(section => ({
      heading: section.heading,
      description: section.prompt,
      ...(section.subsections && {
        subsections: section.subsections.map(subsection => ({
          heading: subsection.heading,
          description: subsection.prompt,
        })),
      }),
    })),
  }, null, 2);

  // Build consultation data dynamically
  const consultationData = buildConsultationData(transcription, quickNotes, typedInput, inputMode);

  // Get process instructions from mapping
  const processInstructions = getProcessInstructions(
    hasAiComponents,
    dsl.settings?.bulletPoints ?? false,
    aiAnalysisInstructions,
  );

  // Build the user message with process instructions
  const userMessage = [
    processInstructions,
    '',
    '--- TEMPLATE DEFINITION ---',
    templateStructure,
    '',
    '--- CONSULTATION DATA ---',
    consultationData,
    '',
    '[Output begins here with template headings and the extracted content.]',
  ].join('\n');

  return {
    system: systemPrompt,
    user: userMessage,
  };
}
