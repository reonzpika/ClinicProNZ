import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';

// Standard OpenAI configuration for all interactions
export const OPENAI_CONFIG: Partial<ChatCompletionCreateParamsNonStreaming> = {
  model: 'gpt-4-0125-preview', // GPT-4 mini model
  temperature: 0.7,
  max_tokens: 500,
  frequency_penalty: 0,
  presence_penalty: 0,
} as const;

// Use case specific configurations
export const OPENAI_CONFIGS: Record<string, Partial<ChatCompletionCreateParamsNonStreaming>> = {
  noteGeneration: {
    ...OPENAI_CONFIG,
    temperature: 0.7,
    max_tokens: 1000,
  },
  clinicalAnalysis: {
    ...OPENAI_CONFIG,
    temperature: 0.5,
    max_tokens: 2000,
  },
  patientSummary: {
    ...OPENAI_CONFIG,
    temperature: 0.3,
    max_tokens: 1500,
  },
};
