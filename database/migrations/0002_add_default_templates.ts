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
          },
          {
            name: 'Objective',
            type: 'text',
            required: true,
            description: 'Physical examination findings and measurements',
          },
          {
            name: 'Assessment',
            type: 'text',
            required: true,
            description: 'Clinical assessment and diagnosis',
          },
          {
            name: 'Plan',
            type: 'text',
            required: true,
            description: 'Treatment plan and follow-up',
          },
        ],
      },
    ],
    prompts: {
      structure: 'Format the consultation notes following the SOAP structure for each problem discussed. For each problem, organize the information into Subjective, Objective, Assessment, and Plan sections.',
    },
  },
  {
    id: uuidv4(),
    name: 'Brief Consultation',
    type: 'default',
    sections: [
      {
        name: 'Reason',
        type: 'text',
        required: true,
        description: 'Main reason for visit',
      },
      {
        name: 'Assessment',
        type: 'text',
        required: true,
        description: 'Brief clinical assessment',
      },
      {
        name: 'Plan',
        type: 'text',
        required: true,
        description: 'Treatment plan',
      },
    ],
    prompts: {
      structure: 'Create concise consultation notes for brief or follow-up visits. Organize the information into three sections: Reason for visit, Assessment, and Plan.',
    },
  },
  {
    id: uuidv4(),
    name: 'Mental Health',
    type: 'default',
    sections: [
      {
        name: 'Presenting Issues',
        type: 'text',
        required: true,
        description: 'Current mental health concerns',
      },
      {
        name: 'Mental State Examination',
        type: 'text',
        required: true,
        description: 'Formal mental state examination findings',
      },
      {
        name: 'Risk Assessment',
        type: 'text',
        required: true,
        description: 'Assessment of risk to self and others',
      },
      {
        name: 'Management Plan',
        type: 'text',
        required: true,
        description: 'Treatment and follow-up plan',
      },
    ],
    prompts: {
      structure: 'Organize the mental health consultation notes to cover presenting issues, mental state examination, risk assessment, and management plan in a clear, structured format.',
    },
  },
];

export async function up(db: any) {
  for (const template of defaultTemplates) {
    await db.insert(sql`
      INSERT INTO templates (id, name, type, sections, prompts, created_at, updated_at)
      VALUES (
        ${template.id},
        ${template.name},
        ${template.type},
        ${JSON.stringify(template.sections)},
        ${JSON.stringify(template.prompts)},
        NOW(),
        NOW()
      )
    `);
  }
}

export async function down(db: any) {
  await db.delete(sql`
    DELETE FROM templates WHERE type = 'default'
  `);
}
