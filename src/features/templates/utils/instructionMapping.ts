import type { TemplateSettings } from '@/features/templates/types';

// AI Analysis component instructions by level
export const AI_ANALYSIS_INSTRUCTIONS = {
  differentialDiagnosis: {
    low: 'Add most likely differential diagnoses with brief reasoning (1 line each)',
    medium: 'Add differential diagnoses with clinical reasoning and likelihood ranking',
    high: 'Add differential diagnoses with detailed clinical reasoning, likelihood assessment, and supporting/contradicting evidence',
  },
  assessmentSummary: {
    low: 'Add concise clinical assessment focusing on key findings and primary diagnosis',
    medium: 'Add clinical assessment with interpretation of findings, diagnostic confidence, and clinical significance',
    high: 'Add comprehensive clinical assessment with detailed interpretation, diagnostic reasoning, risk stratification, and clinical implications',
  },
  managementPlan: {
    low: 'Add essential management steps: immediate actions, key medications, and follow-up timing',
    medium: 'Add structured management plan: investigations, treatments, patient education, safety netting, and follow-up schedule',
    high: 'Add comprehensive management plan: detailed investigations with rationale, treatment options with alternatives, patient education materials, safety netting advice, follow-up protocols, and referral criteria',
  },
} as const;

// AI Analysis component endings
export const AI_ANALYSIS_ENDINGS = {
  differentialDiagnosis: 'based on documented symptoms and findings',
  assessmentSummary: 'based on documented findings',
  managementPlan: 'based on the consultation',
} as const;

// AI Analysis prohibition instructions
export const AI_ANALYSIS_PROHIBITIONS = {
  differentialDiagnosis: 'DO NOT generate differential diagnoses or diagnostic speculation',
  assessmentSummary: 'DO NOT generate clinical assessments or summaries',
  managementPlan: 'DO NOT generate management plans or treatment recommendations',
} as const;

// Helper functions to build instructions
export function buildStyleInstructions(): string {
  return ''; // No style instructions needed
}

export function buildAiAnalysisInstructions(
  components: TemplateSettings['aiAnalysis']['components'],
  level: string,
): string {
  // Get enabled components with specific instructions
  const activeComponents = Object.keys(components)
    .filter(key => components[key as keyof typeof components])
    .map((key) => {
      const componentKey = key as keyof typeof AI_ANALYSIS_INSTRUCTIONS;
      const instruction = AI_ANALYSIS_INSTRUCTIONS[componentKey]?.[level as keyof typeof AI_ANALYSIS_INSTRUCTIONS[typeof componentKey]];
      const ending = AI_ANALYSIS_ENDINGS[componentKey];

      if (!instruction || !ending) {
        return null;
      }

      return `• ${instruction} ${ending}`;
    })
    .filter(Boolean);

  // Get disabled components (that exist in the prohibition map)
  const disabledComponents = Object.keys(AI_ANALYSIS_PROHIBITIONS)
    .filter(key => !components[key as keyof typeof components])
    .map(key => `• ${AI_ANALYSIS_PROHIBITIONS[key as keyof typeof AI_ANALYSIS_PROHIBITIONS]}`);

  // If no components are enabled, just return empty
  if (activeComponents.length === 0) {
    return '';
  }

  let instruction = `Add AI analysis to the specific sections where each component belongs:\n${activeComponents.join('\n')}`;

  // Add prohibitions for disabled features
  if (disabledComponents.length > 0) {
    instruction += `\n\nIMPORTANT RESTRICTIONS:\n${disabledComponents.join('\n')}`;
  }

  return instruction;
}

export function getProcessInstructions(hasAiComponents: boolean, bulletPoints: boolean, aiAnalysisInstructions?: string): string {
  const bulletPointsInstruction = bulletPoints ? ' using concise grouped bullet points.' : '';

  if (hasAiComponents && aiAnalysisInstructions) {
    return `TASK OVERVIEW:
1. The consultation transcript appears under --- CONSULTATION DATA ---.
2. The template structure appears under --- TEMPLATE DEFINITION ---.
3. Read all consultation data first. Then use the template definition to guide your structured consultation note that is ready to be copied and pasted into the PMS.

STEP 1 - CONTENT EXTRACTION INSTRUCTIONS:
1. For each section in the user's template, extract all content that is explicitly stated or verbatim quoted in the consultation data matching that section's heading or user-specified keywords${bulletPointsInstruction} Avoid duplicate or overlapping content. 
2. DO NOT generate, infer, or elaborate beyond what appears in the consultation data, even if the heading implies clinical concepts such as assessment, differential diagnosis, management plan, etc.
3. DO NOT give any clinical reasoning or interpretation of the content.
4. If no matching content is found for a section, do not write anything and insert the blank line. 
5. Any consultation data that does not fit into any of the defined sections must be placed under an additional section labelled:
OTHERS

OUTPUT FORMAT:
1. Follow the exact order and labels of the template definition.
2. Apply the extraction rules above for every section equally.

STEP 2 - Add AI Analysis:
${aiAnalysisInstructions}`;
  } else {
    return `TASK OVERVIEW:
1. The consultation transcript appears under --- CONSULTATION DATA ---.
2. The template structure appears under --- TEMPLATE DEFINITION ---.
3. Read all consultation data first. Then use the template definition to guide your output.

CONTENT EXTRACTION INSTRUCTIONS:
1. For each section in the user's template, extract all content that is explicitly stated or verbatim quoted in the consultation data matching that section's heading or user-specified keywords${bulletPointsInstruction}. 
2. DO NOT generate, infer, or elaborate beyond what appears in the consultation data, even if the heading implies clinical concepts such as assessment, differential diagnosis, management plan, etc.
3. DO NOT give any clinical reasoning or interpretation of the content.
4. If no matching content is found for a section, do not write anything and insert the blank line. 
5. Any consultation data that does not fit into any of the defined sections must be placed under an additional section labelled:
OTHERS

OUTPUT FORMAT:
1. Follow the exact order and labels of the template definition.
2. Apply the extraction rules above for every section equally.`;
  }
}
