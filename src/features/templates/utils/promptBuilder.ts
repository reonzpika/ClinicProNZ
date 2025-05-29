/**
 * Builds the user prompt for the LLM using the new template model.
 * Combines the template prompt, example, transcription, and quick notes.
 */
export function buildTemplatePrompt(
  prompts: { prompt: string; example?: string },
  transcription: string,
  quickNotes: string[],
): string {
  let prompt = prompts.prompt;

  if (prompts.example) {
    prompt += `\n\nFormat each problem using the structure below:\n${prompts.example}`;
  }

  prompt += `\n\n=== TRANSCRIPTION START ===\n${transcription}\n=== TRANSCRIPTION END ===`;

  if (quickNotes?.length) {
    prompt += `\n\n=== QUICKNOTE START ===\n${quickNotes.join('\n')}\n=== QUICKNOTE END ===`;
  }

  return prompt;
}

// Shared system prompt for all templates (import in API and TemplatePreview)
export const SYSTEM_PROMPT = `You are a clinical documentation assistant supporting New Zealand general practitioners. Your role is to accurately and concisely generate structured clinical notes based on consultation transcripts and optional quicknotes.
For each request, you will receive a detailed template prompt that defines the note structure, style, and clinical reasoning rules to apply. Follow the template prompt's instructions precisely.
Use only information explicitly stated in the transcript or quicknotes; do not add, infer, or fabricate details beyond what is provided unless specifically guided by the template prompt.
Always use New Zealand English spelling and clinical conventions. Avoid including any patient identifiers.
The transcripts are single-line, non-diarised recordings without speaker labels. Additional quicknotes may be available to clarify key points.`;
