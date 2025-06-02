import type { TemplateDSL } from '@/features/templates/types';

import { SYSTEM_PROMPT } from './systemPrompt';

export function compileTemplate(
  dsl: TemplateDSL,
  transcription: string,
  quickNotes: string[],
  typedInput?: string,
  inputMode: 'audio' | 'typed' = 'audio',
): { system: string; user: string } {
  // 1. Build USER_PROMPT sections with explicit delimiters
  const lines: string[] = [];

  // a) TEMPLATE DEFINITION
  lines.push('--- TEMPLATE DEFINITION ---');
  lines.push(JSON.stringify(dsl, null, 2));

  // b) CONSULTATION DATA
  lines.push('\n--- CONSULTATION DATA ---');
  if (inputMode === 'typed') {
    lines.push('=== CONSULTATION NOTES ===');
    lines.push(typedInput ?? '');
  } else {
    lines.push('=== TRANSCRIPTION ===');
    lines.push(transcription);
    if (quickNotes.length) {
      lines.push('=== QUICKNOTES ===');
      lines.push(quickNotes.join('\n'));
    }
  }

  // c) INSTRUCTION
  lines.push('\n--- INSTRUCTION ---');
  lines.push(
    `Using only the above, generate a structured clinical note by iterating through each section. `
    + `For each section or subsection output heading then relevant content. `
    + `Use NZ English spelling and conventions. `
    + `Do not infer or fabricate details not present above.`,
  );

  return {
    system: SYSTEM_PROMPT,
    user: lines.join('\n'),
  };
}
