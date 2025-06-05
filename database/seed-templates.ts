import { v4 as uuidv4 } from 'uuid';

import { sql } from './client';

const defaultTemplates = [
  {
    id: 'cef98cee-0062-447f-83c3-537a2ac5bacb',
    name: 'Multi-problem SOAP',
    description: 'A comprehensive SOAP note template for documenting multiple problems during a consultation',
    type: 'default',
    dsl: {
      overallInstructions: 'You will be given a transcription of a general practice consultation. Generate a structured clinical note using the SOAP format. Multiple problems may be discussed in one consultation. Each distinct clinical issue should be presented as a separate problem.',
      sections: [
        {
          heading: 'Problem 1: [Problem Name]',
          prompt: 'Identify the first clinical problem discussed. Use a clinically meaningful and concise title. Group symptoms under one problem only if they clearly relate to a single known clinical condition or body system.',
          subsections: [
            {
              heading: 'S (Subjective)',
              prompt: 'Include patient-reported symptoms, concerns, relevant context, timing or duration of symptoms, and any expressed uncertainty by the patient.',
            },
            {
              heading: 'O (Objective)',
              prompt: 'Include observations, physical exam findings, or doctor commentary mentioned in the transcript.',
            },
            {
              heading: 'A (Assessment)',
              prompt: 'Include only if clearly stated in the transcript. Otherwise, leave blank.',
            },
            {
              heading: 'P (Plan)',
              prompt: 'Include only if clearly stated in the transcript. Otherwise, leave blank.',
            },
          ],
        },
        {
          heading: 'Problem 2: [Problem Name]',
          prompt: 'Identify additional clinical problems if discussed. Repeat the SOAP structure for each distinct problem.',
          subsections: [
            {
              heading: 'S (Subjective)',
              prompt: 'Patient-reported information for this specific problem.',
            },
            {
              heading: 'O (Objective)',
              prompt: 'Objective findings for this specific problem.',
            },
            {
              heading: 'A (Assessment)',
              prompt: 'Assessment for this specific problem if clearly stated.',
            },
            {
              heading: 'P (Plan)',
              prompt: 'Plan for this specific problem if clearly stated.',
            },
          ],
        },
        {
          heading: 'Other Notes',
          prompt: 'Include any small talk, non-clinical statements, or unrelated comments that don\'t fit into the clinical problems above.',
        },
      ],
      settings: {
        detailLevel: 'medium',
        bulletPoints: false,
        aiAnalysis: {
          enabled: false,
          components: {
            differentialDiagnosis: false,
            assessmentSummary: false,
            managementPlan: false,
            redFlags: false,
          },
          level: 'medium',
        },
        abbreviations: false,
      },
    },
  },
  {
    id: uuidv4(),
    name: 'Driver\'s License Medical',
    description: 'Medical assessment template for driver\'s license applications',
    type: 'default',
    dsl: {
      overallInstructions: 'Document the medical assessment for a driver\'s license application based on the consultation transcript.',
      sections: [
        {
          heading: 'Medical History',
          prompt: 'Extract and document relevant medical history mentioned during the consultation that pertains to fitness to drive.',
        },
        {
          heading: 'Examination',
          prompt: 'Document any physical examination findings mentioned in the transcript.',
        },
        {
          heading: 'Vision Assessment',
          prompt: 'Include any vision testing or visual acuity assessments mentioned.',
        },
        {
          heading: 'Assessment',
          prompt: 'Document the doctor\'s assessment of the patient\'s fitness to drive if clearly stated.',
        },
        {
          heading: 'Plan/Recommendation',
          prompt: 'Include the plan or recommendation regarding the driver\'s license application if mentioned.',
        },
      ],
      settings: {
        detailLevel: 'medium',
        bulletPoints: false,
        aiAnalysis: {
          enabled: false,
          components: {
            differentialDiagnosis: false,
            assessmentSummary: false,
            managementPlan: false,
            redFlags: false,
          },
          level: 'medium',
        },
        abbreviations: false,
      },
    },
  },
  {
    id: uuidv4(),
    name: 'General Consultation',
    description: 'A simple template for general consultations',
    type: 'default',
    dsl: {
      sections: [
        {
          heading: 'Chief Complaint',
          prompt: 'Extract the main reason for the patient\'s visit or primary concern.',
        },
        {
          heading: 'History of Present Illness',
          prompt: 'Document the patient\'s description of their current symptoms, including onset, duration, severity, and associated factors.',
        },
        {
          heading: 'Examination',
          prompt: 'Include any physical examination findings or observations mentioned by the doctor.',
        },
        {
          heading: 'Assessment and Plan',
          prompt: 'Document the doctor\'s assessment and treatment plan if clearly stated in the transcript.',
        },
      ],
      settings: {
        detailLevel: 'medium',
        bulletPoints: false,
        aiAnalysis: {
          enabled: false,
          components: {
            differentialDiagnosis: false,
            assessmentSummary: false,
            managementPlan: false,
            redFlags: false,
          },
          level: 'medium',
        },
        abbreviations: false,
      },
    },
  },
];

async function main() {
  try {
    console.error('Inserting default templates...');

    // First, clear any existing default templates
    await sql.query('DELETE FROM templates WHERE type = $1', ['default']);

    // Insert new templates
    for (const template of defaultTemplates) {
      await sql.query(
        'INSERT INTO templates (id, name, description, type, dsl) VALUES ($1, $2, $3, $4, $5)',
        [
          template.id,
          template.name,
          template.description,
          template.type,
          JSON.stringify(template.dsl),
        ],
      );
    }

    console.error('Default templates inserted successfully');
  } catch (error) {
    console.error('Failed to insert templates:', error);
    process.exit(1);
  }
}

main();
