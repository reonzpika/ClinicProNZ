import OpenAI from 'openai';
import { Template } from '../../types/templates';
import { NoteGenerationMetrics } from '../../types/performance';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30 seconds timeout for mini model
  maxRetries: 2,
});

// Type definitions for note generation
export type NoteGenerationRequest = {
  transcription: string;
  template: Template;
  quickNotes: string[];
};

export type NoteGenerationResponse = {
  notes: string;
  status: 'success' | 'error';
  error?: string;
  metrics?: NoteGenerationMetrics;
};

// Helper function to format template sections for prompt
const formatTemplateSections = (template: Template): string => {
  return template.sections
    .map(section => {
      const sectionContent = `
Section: ${section.name}
Description: ${section.description}
Format: ${section.type === 'array' ? 'bullet points' : 'paragraph'}
Required: ${section.required ? 'Yes' : 'No'}
Prompt: ${section.prompt}
${section.subsections ? `\nSubsections:\n${section.subsections.map(sub => `- ${sub.name}: ${sub.prompt}`).join('\n')}` : ''}
`;
      return sectionContent;
    })
    .join('\n');
};

// Helper function to calculate cost estimate
const calculateCostEstimate = (tokenUsage: { promptTokens: number; completionTokens: number }): number => {
  // GPT-4o-mini pricing (placeholder - update with actual pricing when available)
  const PROMPT_COST_PER_1K = 0.005; // $0.005 per 1K tokens (estimated)
  const COMPLETION_COST_PER_1K = 0.015; // $0.015 per 1K tokens (estimated)
  
  const promptCost = (tokenUsage.promptTokens / 1000) * PROMPT_COST_PER_1K;
  const completionCost = (tokenUsage.completionTokens / 1000) * COMPLETION_COST_PER_1K;
  
  return promptCost + completionCost;
};

// Validate the generated notes
const validateNotes = (notes: string, template: Template): boolean => {
  // Check if all required sections are present
  return template.sections
    .filter(section => section.required)
    .every(section => notes.toLowerCase().includes(section.name.toLowerCase()));
};

// Main note generation function
export const generateNote = async ({
  transcription,
  template,
  quickNotes,
}: NoteGenerationRequest): Promise<NoteGenerationResponse> => {
  const startTime = Date.now();
  
  try {
    // Format the system prompt with template details
    const systemPrompt = `You are a medical documentation assistant for New Zealand GPs. Follow NZ medical documentation standards.
${template.prompts.system}

Template Structure:
${formatTemplateSections(template)}

${template.prompts.structure}

Important: Ensure all required sections are clearly labeled and included in the output. Be concise and focused.`;

    // Format user input with transcription and quick notes
    const userInput = `Transcription:\n${transcription}\n\nQuick Notes:\n${quickNotes.join('\n')}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userInput,
        },
      ],
      temperature: 0.1, // Lower temperature for more focused output
      max_tokens: 2000, // Reduced for mini model
      top_p: 0.9, // Slightly reduced for more focused output
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });

    const generatedNotes = response.choices[0]?.message?.content || '';

    // Validate the generated notes
    if (!validateNotes(generatedNotes, template)) {
      throw new Error('Generated notes do not contain all required sections');
    }

    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    const tokenUsage = {
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    };

    const metrics: NoteGenerationMetrics = {
      startTime,
      endTime,
      responseTime,
      tokenUsage,
      costEstimate: calculateCostEstimate(tokenUsage),
      sectionCount: template.sections.length,
      wordCount: transcription.split(/\s+/).length,
      quickNotesCount: quickNotes.length,
    };

    return {
      notes: generatedNotes,
      status: 'success',
      metrics,
    };
  } catch (error) {
    console.error('Note generation error:', error);
    return {
      notes: '',
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to generate note',
    };
  }
}; 