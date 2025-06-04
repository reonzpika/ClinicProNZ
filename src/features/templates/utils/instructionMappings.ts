import type { TemplateSettings } from '../types';

// Instruction mappings as specified in the NEW System and User Message Specifications
export const DETAIL_INSTRUCTIONS = {
  low: 'Write the note with a low level of detail, focusing only on key clinical facts.',
  medium: 'Write the note with a standard level of detail, balancing brevity and necessary context.',
  high: 'Write the note with a high level of detail, including thorough descriptions of symptoms, findings, and rationale.',
} as const;

export const BULLET_INSTRUCTIONS = {
  on: 'Present all sections as concise bullet points for clarity.',
  off: 'Write all sections in narrative paragraph form.',
} as const;

export const ANALYSIS_INSTRUCTIONS = {
  off: 'Do not provide AI analysis; restrict content to factual history and examination details.',
  basic: 'Include basic AI analysis: list possible differential diagnoses succinctly.',
  standard: 'Include standard AI analysis: offer differential diagnoses with brief rationale and suggested next steps.',
  comprehensive: 'Include comprehensive AI analysis: elaborate differential diagnoses, reasoning, investigations, and management options.',
} as const;

export const ABBREVIATION_INSTRUCTIONS = {
  on: 'Use common medical abbreviations where appropriate.',
  off: 'Spell out all medical terms in full; avoid abbreviations.',
} as const;

// Helper function to generate instructions from template settings
export function generateInstructions(settings?: TemplateSettings): {
  detailInstruction: string;
  bulletInstruction: string;
  analysisInstruction: string;
  abbreviationInstruction: string;
} {
  // Use defaults if settings are not provided
  const detailLevel = settings?.detailLevel || 'medium';
  const bulletPoints = settings?.bulletPoints ?? false;
  const aiAnalysisEnabled = settings?.aiAnalysis?.enabled ?? false;
  const aiAnalysisLevel = settings?.aiAnalysis?.level || 'standard';
  const abbreviations = settings?.abbreviations ?? false;

  return {
    detailInstruction: DETAIL_INSTRUCTIONS[detailLevel],
    bulletInstruction: BULLET_INSTRUCTIONS[bulletPoints ? 'on' : 'off'],
    analysisInstruction: aiAnalysisEnabled
      ? ANALYSIS_INSTRUCTIONS[aiAnalysisLevel]
      : ANALYSIS_INSTRUCTIONS.off,
    abbreviationInstruction: ABBREVIATION_INSTRUCTIONS[abbreviations ? 'on' : 'off'],
  };
}
