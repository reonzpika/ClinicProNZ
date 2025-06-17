import { v4 as uuidv4 } from 'uuid';

import type { Template } from '../src/features/templates/types';
import { sql } from './client';

const defaultTemplates: Omit<Template, 'id'>[] = [
  {
    name: 'SOAP Note',
    description: 'Standard SOAP (Subjective, Objective, Assessment, Plan) format for general consultations',
    type: 'default',
    dsl: {
      overallInstructions: 'Extract and organise consultation information into Subjective, Objective, Assessment, and Plan sections.',
      sections: [
        {
          heading: 'S (Subjective)',
          prompt: 'Patient\'s history of presenting complaint and symptoms as described by the patient.',
          subsections: [
            {
              heading: 'History of Presenting Complaint',
              prompt: 'Main complaint and detailed history as described by the patient.',
            },
            {
              heading: 'Past Medical History',
              prompt: 'Relevant past medical history if mentioned.',
            },
            {
              heading: 'Medications',
              prompt: 'Current medications if discussed.',
            },
            {
              heading: 'Social History',
              prompt: 'Relevant social history if mentioned.',
            },
          ],
        },
        {
          heading: 'O (Objective)',
          prompt: 'Clinical examination findings and objective observations.',
        },
        {
          heading: 'A (Assessment)',
          prompt: 'Clinical assessment and diagnosis if clearly stated.',
        },
        {
          heading: 'P (Plan)',
          prompt: 'Treatment plan and management if discussed.',
          subsections: [
            {
              heading: 'Investigations',
              prompt: 'Any investigations ordered or planned.',
            },
            {
              heading: 'Treatment',
              prompt: 'Treatment prescribed or recommended.',
            },
            {
              heading: 'Follow-up',
              prompt: 'Follow-up arrangements if mentioned.',
            },
          ],
        },
      ],
      settings: {
        aiAnalysis: {
          enabled: false,
          components: {
            differentialDiagnosis: false,
            managementPlan: false,
          },
          level: 'medium',
        },
      },
    },
  },
  {
    name: 'Driver\'s License Medical',
    description: 'Medical assessment template for driver\'s license applications',
    type: 'default',
    dsl: {
      overallInstructions: 'Document the medical assessment for a driver\'s license application based on the consultation transcript.',
      sections: [
        {
          heading: 'Medical History',
          prompt: 'Extract relevant medical history that may affect driving ability.',
        },
        {
          heading: 'Current Medications',
          prompt: 'List current medications and assess any impact on driving ability.',
        },
        {
          heading: 'Physical Examination',
          prompt: 'Document relevant physical examination findings.',
        },
        {
          heading: 'Vision Assessment',
          prompt: 'Include any vision testing or visual acuity assessments mentioned.',
        },
        {
          heading: 'Other Assessments',
          prompt: 'Include any other relevant assessments (hearing, cognitive, etc.) if mentioned.',
        },
        {
          heading: 'Assessment',
          prompt: 'Document the doctor\'s assessment of the patient\'s fitness to drive if clearly stated.',
        },
        {
          heading: 'Recommendations',
          prompt: 'Include any recommendations or restrictions if mentioned.',
        },
      ],
      settings: {
        aiAnalysis: {
          enabled: false,
          components: {
            differentialDiagnosis: false,
            managementPlan: false,
          },
          level: 'medium',
        },
      },
    },
  },
  {
    name: 'General Consultation',
    description: 'Simple template for routine consultations',
    type: 'default',
    dsl: {
      overallInstructions: 'Extract key information from the consultation in a clear, organised format.',
      sections: [
        {
          heading: 'Presenting Complaint',
          prompt: 'Main reason for the consultation and symptoms described.',
        },
        {
          heading: 'History',
          prompt: 'Relevant history of the presenting complaint and background information.',
        },
        {
          heading: 'Examination',
          prompt: 'Physical examination findings if mentioned.',
        },
        {
          heading: 'Assessment and Plan',
          prompt: 'Document the doctor\'s assessment and treatment plan if clearly stated in the transcript.',
        },
      ],
      settings: {
        aiAnalysis: {
          enabled: false,
          components: {
            differentialDiagnosis: false,
            managementPlan: false,
          },
          level: 'medium',
        },
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
          uuidv4(),
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
