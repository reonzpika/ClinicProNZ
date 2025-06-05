import type { TemplateSettings } from '../types';

// Instruction mappings as specified in the NEW System and User Message Specifications
export const DETAIL_INSTRUCTIONS = {
  low: 'Write the note with a low level of detail, focusing only on key clinical facts.',
  medium: 'Write the note with a standard level of detail, balancing brevity and necessary context.',
  high: 'Write the note with a high level of detail, including thorough descriptions of symptoms, findings, and rationale.',
} as const;

export const BULLET_INSTRUCTIONS = {
  on: 'Present content and subsection headings as concise bullet points for clarity. Keep main section headings as regular headings, not bullet points.',
  off: 'Write all sections in narrative paragraph form.',
} as const;

export const ANALYSIS_INSTRUCTIONS = {
  off: 'Do not provide AI analysis; restrict content to factual history and examination details.',
} as const;

// Component-specific analysis instructions
export const ANALYSIS_COMPONENTS = {
  differentialDiagnosis: {
    low: 'List most likely differential diagnoses.',
    medium: 'Provide differential diagnoses with brief rationale for each.',
    high: 'Provide comprehensive differential diagnoses with detailed reasoning, likelihood assessment, and supporting/contradicting evidence.',
  },
  assessmentSummary: {
    low: 'Provide a brief clinical assessment summary.',
    medium: 'Summarize the clinical assessment with key findings and clinical significance.',
    high: 'Provide detailed clinical assessment including symptom analysis, examination correlation, and clinical reasoning.',
  },
  managementPlan: {
    low: 'Outline basic management steps.',
    medium: 'Provide structured management plan with immediate and follow-up actions.',
    high: 'Develop comprehensive management plan including immediate care, ongoing treatment, patient education, and monitoring.',
  },
  redFlags: {
    low: 'Create a new section and note any obvious red flag symptoms.',
    medium: 'Create a new section and identify and explain relevant red flag symptoms or warning signs.',
    high: 'Create a new section and comprehensive red flag assessment with clinical significance, urgency indicators, and action thresholds.',
  },
  investigations: {
    low: 'Suggest essential investigations only.',
    medium: 'Recommend appropriate investigations with basic rationale.',
    high: 'Detailed investigation plan with rationale, timing, interpretation guidance, and follow-up requirements.',
  },
  followUp: {
    low: 'Indicate basic follow-up needs.',
    medium: 'Specify follow-up timing and key monitoring points.',
    high: 'Comprehensive follow-up plan including timing, specific monitoring parameters, patient instructions, and escalation criteria.',
  },
} as const;

export const OPTIONAL_SECTIONS_INSTRUCTIONS = `
SECTION GENERATION RULES:
- REQUIRED sections/subsections (optional: false or undefined): Must always generate, even with minimal content. If no information exists, include the heading with blank content.
- OPTIONAL sections/subsections (optional: true): Only generate if meaningful, relevant content is available. If no relevant content exists, completely omit the section including its heading. Apply a quality threshold - only include if the content adds clinical value.
` as const;

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
  optionalSectionsInstruction: string;
} {
  // Use defaults if settings are not provided
  const detailLevel = settings?.detailLevel || 'medium';
  const bulletPoints = settings?.bulletPoints ?? false;
  const aiAnalysisEnabled = settings?.aiAnalysis?.enabled ?? false;
  const abbreviations = settings?.abbreviations ?? false;

  // Build dynamic analysis instruction
  let analysisInstruction: string = ANALYSIS_INSTRUCTIONS.off;

  if (aiAnalysisEnabled && settings?.aiAnalysis?.components) {
    const { components, level } = settings.aiAnalysis;
    const analysisLevel = level || 'medium';
    const selectedComponents: string[] = [];

    // Build instructions for each selected component
    if (components.differentialDiagnosis) {
      selectedComponents.push(ANALYSIS_COMPONENTS.differentialDiagnosis[analysisLevel]);
    }
    if (components.assessmentSummary) {
      selectedComponents.push(ANALYSIS_COMPONENTS.assessmentSummary[analysisLevel]);
    }
    if (components.managementPlan) {
      selectedComponents.push(ANALYSIS_COMPONENTS.managementPlan[analysisLevel]);
    }
    if (components.redFlags) {
      selectedComponents.push(ANALYSIS_COMPONENTS.redFlags[analysisLevel]);
    }
    if (components.investigations) {
      selectedComponents.push(ANALYSIS_COMPONENTS.investigations[analysisLevel]);
    }
    if (components.followUp) {
      selectedComponents.push(ANALYSIS_COMPONENTS.followUp[analysisLevel]);
    }

    if (selectedComponents.length > 0) {
      analysisInstruction = `Include AI analysis with the following components: ${selectedComponents.join(' ')}`;
    }
  }

  return {
    detailInstruction: DETAIL_INSTRUCTIONS[detailLevel],
    bulletInstruction: BULLET_INSTRUCTIONS[bulletPoints ? 'on' : 'off'],
    analysisInstruction,
    abbreviationInstruction: ABBREVIATION_INSTRUCTIONS[abbreviations ? 'on' : 'off'],
    optionalSectionsInstruction: OPTIONAL_SECTIONS_INSTRUCTIONS,
  };
}
