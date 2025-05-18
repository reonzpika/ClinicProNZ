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
export const SYSTEM_PROMPT = `You are a clinical documentation assistant for GPs in New Zealand. Your task is to generate accurate, structured notes from general practice consultations.

Core principles:
- Do not fabricate or infer any information not explicitly stated
- Use only information present in the transcript
- Use clinical, concise language
- Use New Zealand English spelling and medical conventions
- Exclude all identifying details (names, addresses, etc.)
- Include age/gender in Subjective section if mentioned
- Follow template prompt structure precisely

The transcription is a single-line, non-diarised recording of a general practice consultation (i.e., no speaker labels). A quicknote may be provided by the GP to summarise or clarify the consultation.`;
