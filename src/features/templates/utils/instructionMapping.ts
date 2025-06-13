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

// AI Analysis example outputs by component
export const AI_ANALYSIS_EXAMPLES = {
  differentialDiagnosis: {
    low: '- Migraine\n- Tension headache',
    medium: '- Migraine (family history, typical pattern)\n- Tension headache (consider)',
    high: '- Primary: Migraine (strong family history, 2-day duration typical)\n- Secondary: Tension headache (less likely given family history)\n- Rule out: Secondary headache (no red flags present)',
  },
  assessmentSummary: {
    low: '- 2-day headache\n- Likely migraine given family history',
    medium: '- Acute headache episode, consistent with migraine pattern\n- Family history supports diagnosis\n- No concerning features',
    high: '- Acute headache presentation with 2-day duration\n- Clinical picture consistent with migraine: positive family history, typical duration\n- No red flag symptoms identified\n- Low risk for secondary pathology',
  },
  managementPlan: {
    low: '- Simple analgesia\n- Rest\n- Follow-up if worsens',
    medium: '- Acute: Paracetamol 1g QID, ibuprofen 400mg TDS\n- Lifestyle: adequate hydration, rest\n- Safety net: return if severe/persistent\n- Follow-up: 1 week if not improving',
    high: '- Immediate: Paracetamol 1000mg QDS + Ibuprofen 400mg TDS PRN\n- Consider sumatriptan if severe\n- Lifestyle advice: regular meals, hydration, sleep hygiene\n- Patient education: migraine triggers, when to seek help\n- Safety netting: return if thunderclap headache, neurological symptoms, or no improvement in 48hrs\n- Follow-up: routine appointment in 1-2 weeks if symptoms persist',
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

  // Build assessment example (combines differential diagnosis and assessment summary)
  const assessmentParts: string[] = [];

  if (components.assessmentSummary) {
    const assessmentExample = AI_ANALYSIS_EXAMPLES.assessmentSummary[level as keyof typeof AI_ANALYSIS_EXAMPLES.assessmentSummary];
    if (assessmentExample) {
      assessmentParts.push(`\nClinical Assessment:\n${assessmentExample}`);
    }
  }
  if (components.differentialDiagnosis) {
    const diffExample = AI_ANALYSIS_EXAMPLES.differentialDiagnosis[level as keyof typeof AI_ANALYSIS_EXAMPLES.differentialDiagnosis];
    if (diffExample) {
      assessmentParts.push(`\nDifferential:\n${diffExample}`);
    }
  }

  examples.assessmentExample = assessmentParts.length > 0 ? assessmentParts.join('\n') : '';

  // Build plan example
  if (components.managementPlan) {
    const planExample = AI_ANALYSIS_EXAMPLES.managementPlan[level as keyof typeof AI_ANALYSIS_EXAMPLES.managementPlan];
    examples.planExample = planExample ? `\n${planExample}` : '';
  }

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
