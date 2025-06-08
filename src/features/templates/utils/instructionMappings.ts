import type { TemplateSettings } from '../types';

// Instruction mappings optimized for AI comprehension
export const DETAIL_INSTRUCTIONS = {
  low: 'Low detail: key clinical facts only.',
  medium: 'Standard detail: balanced brevity and context.',
  high: 'High detail: thorough descriptions and rationale.',
} as const;

export const BULLET_INSTRUCTIONS = {
  on: 'Use bullet points for content and subsection headings. Keep main section headings as headings.',
  off: 'Use narrative paragraph form.',
} as const;

export const ANALYSIS_INSTRUCTIONS = {
  off: 'No AI analysis. Factual history and examination only.',
} as const;

// Red flags definition optimized for AI
export const RED_FLAGS_DEFINITION = `
RED FLAGS: Symptoms suggesting serious pathology requiring urgent attention.
Examples (not exhaustive):
- Severe headache + fever/neck stiffness/altered mental state
- Chest pain + cardiac risk factors
- Sudden severe symptoms/rapid deterioration
- New/worsening neurological deficits
- Signs of infection/sepsis/systemic illness
- Severe disproportionate pain
- Breathing difficulties/respiratory distress
- Loss of consciousness/altered mental state
- Severe bleeding/hemorrhage
- Suicidal ideation/self-harm risk
- Any life/limb threatening pattern

Use clinical reasoning for other concerning presentations.
` as const;

// Component-specific analysis instructions optimized
export const ANALYSIS_COMPONENTS = {
  differentialDiagnosis: {
    low: 'Add likely differential diagnoses to Assessment section or create "Differential Diagnosis" section. Heading: "Differential Diagnosis:"',
    medium: 'Add differential diagnoses with brief rationale to Assessment section or create "Differential Diagnosis" section. Heading: "Differential Diagnosis:"',
    high: 'Add comprehensive differential diagnoses with detailed reasoning and evidence to Assessment section or create "Differential Diagnosis" section. Heading: "Differential Diagnosis:"',
  },
  assessmentSummary: {
    low: 'Add brief clinical summary to Assessment section or create "Clinical Assessment" section.',
    medium: 'Add clinical summary with key findings to Assessment section or create "Clinical Assessment" section.',
    high: 'Add detailed clinical summary with symptom analysis and reasoning to Assessment section or create "Clinical Assessment" section.',
  },
  managementPlan: {
    low: 'Add management steps, investigations, and follow-up to Plan section or create "Plan" section.',
    medium: 'Add structured management plan, investigations with rationale, and follow-up timing to Plan section or create "Plan" section.',
    high: 'Add comprehensive management plan, detailed investigations with rationale and timing, and complete follow-up plan to Plan section or create "Plan" section.',
  },
  redFlags: {
    low: 'Identify red flag symptoms. Add to Assessment section or create "RED FLAGS" section. Heading: "RED FLAGS:"',
    medium: 'Identify red flag symptoms with clinical significance. Add to Assessment section or create "RED FLAGS" section. Heading: "RED FLAGS:"',
    high: 'Identify comprehensive red flags with clinical significance and urgency indicators. Add to Assessment section or create "RED FLAGS" section. Heading: "RED FLAGS:"',
  },
} as const;

export const OPTIONAL_SECTIONS_INSTRUCTIONS = `
SECTION RULES:
- Template descriptions indicate CONTENT TYPE only, not instructions to generate content.
- Check each section/subsection in the template for "optional": true flag
- REQUIRED sections (no "optional": true flag): Always generate heading and all subsections. If no relevant content exists for a subsection, output the heading followed by a blank line with no content whatsoever.
- OPTIONAL sections (has "optional": true flag): Only generate if meaningful content exists in consultation data. If no relevant content, skip entirely (no heading, no content).
- All subsections follow their parent section's rules - if parent section is required, generate all subsections; if parent is optional and generated, generate all its subsections.
- NEVER generate content that was not explicitly discussed in the consultation, regardless of what the template description mentions.
` as const;

export const ABBREVIATION_INSTRUCTIONS = {
  on: 'Use medical abbreviations.',
  off: 'Spell out all terms.',
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

    if (selectedComponents.length > 0) {
      let instruction = `Integrate AI analysis into existing sections or create new sections.\n\n`;

      // Add red flags definition if red flags component is enabled
      if (components.redFlags) {
        instruction += `${RED_FLAGS_DEFINITION}\n\n`;
      }

      instruction += `Components:\n${selectedComponents.map(component => `- ${component}`).join('\n')}`;

      analysisInstruction = instruction;
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
