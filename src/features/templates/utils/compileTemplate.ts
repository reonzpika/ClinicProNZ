import type { TemplateDSL } from '@/features/templates/types';

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
  // Generate base system prompt with AI analysis if enabled
  const aiAnalysisEnabled = dsl.settings?.aiAnalysis?.enabled ?? false;
  const aiAnalysisComponents = aiAnalysisEnabled ? dsl.settings?.aiAnalysis?.components : undefined;
  const aiAnalysisLevel = dsl.settings?.aiAnalysis?.level || 'medium';

  const systemPrompt = generateSystemPrompt(aiAnalysisComponents, aiAnalysisLevel);

  // Prepare template structure (JSON format as specified) - clinical content structure only
  const templateStructure = JSON.stringify({
    sections: dsl.sections.map(section => ({
      heading: section.heading,
      prompt: section.prompt,
      ...(section.subsections && {
        subsections: section.subsections.map(subsection => ({
          heading: subsection.heading,
          prompt: subsection.prompt,
        })),
      }),
    })),
  }, null, 2);

  // Build consultation data dynamically
  const consultationData = buildConsultationData(transcription, quickNotes, typedInput, inputMode);

  // Build the user message with process instructions
  const userMessage = [
    '--- TEMPLATE DEFINITION ---',
    templateStructure,
    '',
    '--- CONSULTATION DATA ---',
    consultationData,
    '',
    '[Output begins here.]',
  ].join('\n');

  return {
    system: systemPrompt,
    user: userMessage,
  };
}
