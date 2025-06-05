// Base system prompt for ConsultAI NZ Note Generation API
const BASE_SYSTEM_PROMPT = `Generate clinical notes for New Zealand GPs from consultation data using provided templates.

RULES:
- Use only provided information. No hallucinations.
- No prescribing, legal, or treatment advice.
- NZ English spelling and clinical phrasing.
- Output final note only. No explanations or metadata.`;

// System prompt when AI analysis is disabled
const TEMPLATE_ONLY_PROMPT = `

STRUCTURE:
- Follow TEMPLATE DEFINITION structure exactly.
- Use CONSULTATION DATA as source material only.
- Apply all INSTRUCTIONS directives.
- Do not create additional sections.`;

// System prompt when AI analysis is enabled
const ANALYSIS_ENABLED_PROMPT = `

STRUCTURE:
- Use TEMPLATE DEFINITION as foundation.
- Integrate AI ANALYSIS components into existing sections or create new sections as instructed.
- Use CONSULTATION DATA as source material only.
- Apply all INSTRUCTIONS directives.`;

// Function to generate dynamic system prompt
export function generateSystemPrompt(aiAnalysisEnabled: boolean): string {
  const basePrompt = BASE_SYSTEM_PROMPT;
  const specificPrompt = aiAnalysisEnabled ? ANALYSIS_ENABLED_PROMPT : TEMPLATE_ONLY_PROMPT;
  return `${basePrompt}${specificPrompt}`;
}

// Legacy export for backward compatibility
export const SYSTEM_PROMPT = generateSystemPrompt(false);
