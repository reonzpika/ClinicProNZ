import { v4 as uuidv4 } from 'uuid';

import { sql } from './client';

const defaultTemplates = [
  {
    id: 'cef98cee-0062-447f-83c3-537a2ac5bacb',
    name: 'Multi-problem SOAP',
    description: 'A comprehensive SOAP note template for documenting multiple problems during a consultation',
    type: 'default',
    prompts: {
      prompt: `You will be given a transcription of a general practice consultation. Based on the transcript, generate a structured clinical note using the SOAP format (Subjective, Objective, Assessment, Plan).\n\nMultiple problems may be discussed in one consultation. Each distinct clinical issue should be presented as a separate problem.\n\nProblem splitting guidelines:\n- Group symptoms under one problem only if they clearly relate to a single known clinical condition or body system (e.g., cough + runny nose = upper respiratory tract infection).\n- If you are not confident about grouping, treat them as separate problems.\n- Use clinically meaningful and concise titles for each problem (e.g., "Sore Throat", "Abdominal Pain", "Prescription Request").\n- Include non-symptom-based clinical matters such as repeat prescriptions or medical certificate requests as valid problems.\n\nIn the Subjective (S), include:\n- Patient-reported symptoms, concerns, and relevant context.\n- Any mention of timing or duration of symptoms.\n- Any expressed uncertainty by the patient, marked appropriately.\n\nIn the Objective (O), include:\n- Observations, physical exam findings, or doctor commentary mentioned in the transcript.\n\nIn Assessment (A) and Plan (P):\n- Include only if clearly stated in the transcript. Otherwise, leave them blank.\n\nIf no clear clinical issue is identifiable in the transcript, output:\nNo clear clinical problems discussed.`,
      example: `## Problem 1: Sore Throat\n\n**S:** [Subjective in paragraph form — include symptoms, context, duration.]\n\n**O:** [Objective findings or doctor commentary.]\n\n**A:** [Include only if clearly stated.]\n\n**P:** [Include only if clearly stated.]\n\n## Problem 2: ...\n\n## Other Notes:\n[Any small talk, non-clinical statements, or unrelated comments.]`,
    },
  },
  {
    id: uuidv4(),
    name: 'Driver\'s License Medical',
    type: 'default',
    prompts: {
      prompt: `Document the medical assessment for a driver's license application. Include medical history, examination, vision, assessment, and plan/recommendation.`,
      example: `Medical History: ...\nExamination: ...\nVision: ...\nAssessment: ...\nPlan/Recommendation: ...`,
    },
  },
];

async function main() {
  try {
    console.log('Inserting default templates...');

    // First, clear any existing default templates
    await sql.query('DELETE FROM templates WHERE type = $1', ['default']);

    // Insert new templates
    for (const template of defaultTemplates) {
      await sql.query(
        'INSERT INTO templates (id, name, type, prompts) VALUES ($1, $2, $3, $4)',
        [
          template.id,
          template.name,
          template.type,
          JSON.stringify(template.prompts),
        ],
      );
    }

    console.log('Default templates inserted successfully');
  } catch (error) {
    console.error('Failed to insert templates:', error);
    process.exit(1);
  }
}

main();
