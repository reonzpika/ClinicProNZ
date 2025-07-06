import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const defaultTemplates = [
  {
    id: uuidv4(),
    name: 'Multi-problem SOAP (Default)',
    type: 'default',
    sections: [
      {
        name: 'Problems',
        type: 'array',
        required: true,
        description: 'List of problems discussed during consultation',
        subsections: [
          {
            name: 'Subjective',
            type: 'text',
            required: true,
            description: 'Patient history and symptoms',
            prompt: 'Summarize the patient\'s main concerns and history for this problem.',
          },
          {
            name: 'Objective',
            type: 'text',
            required: true,
            description: 'Physical examination findings and measurements',
            prompt: 'List all relevant clinical findings, vital signs, and examination results for this problem.',
          },
          {
            name: 'Assessment',
            type: 'text',
            required: true,
            description: 'Clinical assessment and diagnosis',
            prompt: 'Provide a clear clinical assessment or diagnosis for this problem.',
          },
          {
            name: 'Plan',
            type: 'text',
            required: true,
            description: 'Treatment plan and follow-up',
            prompt: 'List all treatment actions, medications, and follow-up plans for this problem.',
          },
        ],
        prompt: 'For each problem, provide a complete SOAP note.',
      },
    ],
    prompts: {
      structure: 'Format the consultation notes following the SOAP structure for each problem discussed. For each problem, organize the information into Subjective, Objective, Assessment, and Plan sections.',
    },
  },
  {
    id: uuidv4(),
    name: 'Driver\'s License Medical',
    type: 'default',
    sections: [
      {
        name: 'Medical History',
        type: 'text',
        required: true,
        description: 'Relevant medical history for driving',
        prompt: 'Summarize the patient\'s relevant medical history for driving.',
      },
      {
        name: 'Examination',
        type: 'text',
        required: true,
        description: 'Physical examination findings',
        prompt: 'Document the findings of the physical examination relevant to driving.',
      },
      {
        name: 'Vision',
        type: 'text',
        required: true,
        description: 'Vision assessment',
        prompt: 'Describe the results of the vision assessment.',
      },
      {
        name: 'Assessment',
        type: 'text',
        required: true,
        description: 'Overall clinical assessment',
        prompt: 'Provide your overall clinical assessment regarding fitness to drive.',
      },
      {
        name: 'Plan/Recommendation',
        type: 'text',
        required: true,
        description: 'Plan and recommendations',
        prompt: 'State your recommendations and any follow-up required for the driver\'s license application.',
      },
    ],
    prompts: {
      structure: 'Document the medical assessment for a driver\'s license application. Include medical history, examination, vision, assessment, and plan/recommendation.',
    },
  },
];

export async function up(db: any) {
  for (const template of defaultTemplates) {
    await db.execute(sql`
      INSERT INTO templates (id, name, type, sections, prompts)
      VALUES (
        ${template.id},
        ${template.name},
        ${template.type},
        ${JSON.stringify(template.sections)},
        ${JSON.stringify(template.prompts)}
      )
    `);
  }
}

export async function down(db: any) {
  await db.execute(sql`
    DELETE FROM templates WHERE type = 'default'
  `);
}
