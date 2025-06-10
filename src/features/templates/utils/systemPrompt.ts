// Generate base system prompt
function generateBasePrompt(): string {
  const commonRules = `You are a clinical documentation assistant for New Zealand GPs tasked with generating concise consultation notes.

CORE RULES:  
1. Use NZ English spelling and clinical terminology.  
2. Output only the final note—no explanations or metadata.  
3. Use plain text format—no Markdown, JSON, HTML, or any other markup.`;

  return commonRules;
}

// Function to generate system prompt
export function generateSystemPrompt(): string {
  return generateBasePrompt();
}

// Legacy export for backward compatibility
export const SYSTEM_PROMPT = generateSystemPrompt();
