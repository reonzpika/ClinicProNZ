import type { TemplateSettings } from '@/features/templates/types';

// AI Analysis component instructions by level
export const AI_ANALYSIS_INSTRUCTIONS = {
  differentialDiagnosis: {
    low: 'Add most likely differential diagnoses (1 line each)',
    medium: 'Add differential diagnoses with brief clinical reasoning and likelihood ranking',
    high: 'Add differential diagnoses with detailed clinical reasoning and likelihood assessment and confidence level',
  },
  managementPlan: {
    low: 'Add high-level essential GP management plan',
    medium: 'Add high-level essential GP management plan',
    high: 'Add high-level essential GP management plan',
  },
} as const;

// AI Analysis component endings
export const AI_ANALYSIS_ENDINGS = {
  differentialDiagnosis: 'based on documented symptoms and findings',
  managementPlan: 'based on the consultation',
} as const;

// AI Analysis prohibition instructions
export const AI_ANALYSIS_PROHIBITIONS = {
  differentialDiagnosis: 'DO NOT generate differential diagnoses or diagnostic speculation',
  managementPlan: 'DO NOT generate management plans or treatment recommendations',
} as const;

// AI Analysis example outputs by component
export const AI_ANALYSIS_EXAMPLES = {
  differentialDiagnosis: {
    low: '- Migraine\n- Tension headache',
    medium: '- Migraine (family history, typical pattern)\n- Tension headache (consider)',
    high: '- Primary: Migraine (strong family history, 2-day duration typical)\n- Secondary: Tension headache (less likely given family history)\n- Rule out: Secondary headache (no red flags present)',
  },
  managementPlan: {
    low: '- Simple analgesia\n- Rest\n- Follow-up if worsens',
    medium: '- Simple analgesia\n- Rest\n- Follow-up if worsens',
    high: '- Simple analgesia\n- Rest\n- Follow-up if worsens',
  },
} as const;

// AI Analysis examples for headache problems
export const AI_ANALYSIS_EXAMPLES_HEADACHE = {
  differentialDiagnosis: {
    low: '- Migraine without aura\n- Tension-type headache',
    medium: '- Migraine without aura (photophobia, nausea, episodic)\n- Tension-type headache (evening worsening pattern)\n- Consider secondary headache (new onset)',
    high: '- Primary: Migraine without aura (photophobia, nausea, partial response to analgesia)\n- Secondary: Tension-type headache (evening worsening, first-time presentation)\n- Rule out: Secondary headache (new-onset 2-month history warrants investigation)',
  },
  managementPlan: {
    low: '- Continue paracetamol as needed\n- Headache diary\n- Safety net advice\n- Review in 2 weeks',
    medium: '- Continue paracetamol, consider regular use if frequent\n- Headache diary to identify triggers\n- Lifestyle advice: sleep hygiene, hydration, stress management\n- Safety net: return if worsening or new symptoms\n- Consider investigation if no improvement in 4 weeks',
    high: '- Analgesia: Continue paracetamol, consider adding ibuprofen for severe episodes\n- Headache diary and trigger identification\n- Lifestyle modifications: regular sleep, hydration, stress reduction\n- Consider investigation (blood tests, consider imaging if red flags develop)\n- Safety net: return immediately if sudden severe headache, neurological symptoms, or fever\n- Review in 2-4 weeks for response assessment',
  },
} as const;

// AI Analysis examples for abdominal pain problems
export const AI_ANALYSIS_EXAMPLES_ABDO = {
  differentialDiagnosis: {
    low: '- Gastroenteritis\n- IBS',
    medium: '- Gastroenteritis (food history, acute onset)\n- IBS (possible, chronic symptoms)',
    high: '- Primary: Gastroenteritis (recent takeaway, acute 5-day onset)\n- Secondary: IBS (consider if symptoms persist)\n- Rule out: IBD (no blood, short duration)',
  },
  managementPlan: {
    low: '- Oral rehydration\n- BRAT diet\n- Return if symptoms persist >7 days',
    medium: '- Oral rehydration\n- BRAT diet\n- Return if symptoms persist >7 days',
    high: '- Oral rehydration\n- BRAT diet\n- Return if symptoms persist >7 days',
  },
} as const;

// Helper functions to build instructions
export function buildStyleInstructions(): string {
  return ''; // No style instructions needed
}

// Function to build AI analysis examples
export function buildAiAnalysisExamples(
  components: TemplateSettings['aiAnalysis']['components'],
  level: string,
): { assessmentExample: string; planExample: string } {
  const examples = {
    assessmentExample: '',
    planExample: '',
  };

  // Early return if components is undefined
  if (!components) {
    return examples;
  }

  // Build differential diagnosis example
  const diffExample = components.differentialDiagnosis
    ? AI_ANALYSIS_EXAMPLES.differentialDiagnosis[level as keyof typeof AI_ANALYSIS_EXAMPLES.differentialDiagnosis]
    : null;
  examples.assessmentExample = diffExample ? `\nDifferential:\n${diffExample}` : '';

  // Build plan example
  const planExample = components.managementPlan
    ? AI_ANALYSIS_EXAMPLES.managementPlan[level as keyof typeof AI_ANALYSIS_EXAMPLES.managementPlan]
    : null;
  examples.planExample = planExample ? `\n${planExample}` : '';

  return examples;
}

export function buildAiAnalysisInstructions(
  components: TemplateSettings['aiAnalysis']['components'],
  level: string,
): string {
  // Early return if components is undefined
  if (!components) {
    return '';
  }

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

// Helper function to build problem-specific examples
export function buildProblemSpecificExamples(
  components: TemplateSettings['aiAnalysis']['components'],
  level: string,
  problemType: 'headache' | 'abdo',
): { assessmentExample: string; planExample: string } {
  const examples = {
    assessmentExample: '',
    planExample: '',
  };

  if (!components) {
    return examples;
  }

  const exampleSource = problemType === 'headache' ? AI_ANALYSIS_EXAMPLES_HEADACHE : AI_ANALYSIS_EXAMPLES_ABDO;

  // Build differential diagnosis example
  const diffExample = components.differentialDiagnosis
    ? exampleSource.differentialDiagnosis[level as keyof typeof exampleSource.differentialDiagnosis]
    : null;
  examples.assessmentExample = diffExample ? `\nDifferential:\n${diffExample}` : '';

  // Build plan example
  const planExample = components.managementPlan
    ? exampleSource.managementPlan[level as keyof typeof exampleSource.managementPlan]
    : null;
  examples.planExample = planExample ? `\n${planExample}` : '';

  return examples;
}
