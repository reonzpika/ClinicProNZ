import type { NoteTemplate } from '@/types';

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'soap',
    name: 'SOAP Note',
    description: 'Subjective, Objective, Assessment, and Plan format',
    structure: {
      sections: [
        {
          key: 'subjective',
          label: 'Subjective',
          prompt: 'Extract patient symptoms, complaints, and history from the consultation',
          required: true,
        },
        {
          key: 'objective',
          label: 'Objective',
          prompt: 'Extract physical examination findings, vital signs, and test results',
          required: true,
        },
        {
          key: 'assessment',
          label: 'Assessment',
          prompt: 'Identify diagnoses, differential diagnoses, and clinical reasoning',
          required: true,
        },
        {
          key: 'plan',
          label: 'Plan',
          prompt: 'Extract treatment plans, medications, follow-up, and referrals',
          required: true,
        },
      ],
    },
  },
  {
    id: 'problem-oriented',
    name: 'Problem-Oriented',
    description: 'Organized by clinical problems',
    structure: {
      sections: [
        {
          key: 'problems',
          label: 'Problems List',
          prompt: 'List all identified clinical problems from most to least urgent',
          required: true,
        },
        {
          key: 'history',
          label: 'History',
          prompt: 'Relevant history for each problem',
          required: true,
        },
        {
          key: 'examination',
          label: 'Examination',
          prompt: 'Physical examination findings relevant to each problem',
          required: true,
        },
        {
          key: 'management',
          label: 'Management',
          prompt: 'Management plan for each identified problem',
          required: true,
        },
      ],
    },
  },
  {
    id: 'history-taking',
    name: 'History Taking',
    description: 'Detailed history with multiple presenting complaints',
    structure: {
      sections: [
        {
          key: 'presenting_complaints',
          label: 'Presenting Complaint(s)',
          prompt: 'List the main presenting complaints and their duration',
          required: false
        },
        {
          key: 'history_of_presenting_illness',
          label: 'History of Presenting Illness',
          prompt: 'For each complaint:\n- Onset and progression\n- Character and severity\n- Aggravating/relieving factors\n- Associated symptoms\n- Previous episodes\n- Impact on daily activities',
          required: false
        },
        {
          key: 'medical_history',
          label: 'Past Medical History',
          prompt: 'Relevant medical conditions, surgeries, hospitalizations',
          required: false
        },
        {
          key: 'medications',
          label: 'Current Medications',
          prompt: 'Regular medications, allergies, recent medication changes',
          required: false
        },
        {
          key: 'social_history',
          label: 'Social History',
          prompt: 'Relevant lifestyle factors, occupation, living situation',
          required: false
        },
        {
          key: 'family_history',
          label: 'Family History',
          prompt: 'Relevant family medical conditions',
          required: false
        },
        {
          key: 'systems_review',
          label: 'Systems Review',
          prompt: 'Relevant findings from review of other body systems',
          required: false
        }
      ]
    }
  }
]; 