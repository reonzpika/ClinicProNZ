import type { NoteTemplate } from '@/types';

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'multi-problem-soap',
    name: 'Multi-Problem SOAP',
    description: 'Default template for handling multiple problems in one consultation',
    structure: {
      sections: [
        {
          key: 'context',
          label: 'Context',
          prompt: 'Brief overview of consultation including reason for visit, time allocated, and general context',
          required: true,
        },
        {
          key: 'problems_list',
          label: 'Problems List',
          prompt: 'List all problems addressed in order of priority, including duration and severity',
          required: true,
        },
        {
          key: 'problem_details',
          label: 'Problem Details',
          prompt: 'For each problem provide:\nS: Subjective findings\nO: Objective findings\nA: Assessment/diagnosis\nP: Plan including management, medications, and follow-up',
          required: true,
        },
        {
          key: 'general_notes',
          label: 'General Notes',
          prompt: 'Document findings or plans that apply across problems (e.g., general appearance, vital signs, overall health status)',
          required: false,
        },
      ],
    },
  },
  {
    id: 'well-child',
    name: '6 Week Check',
    description: 'Well child check including both baby and maternal check',
    structure: {
      sections: [
        {
          key: 'baby_history',
          label: 'Baby History',
          prompt: 'Document feeding patterns, sleep, output, parental concerns',
          required: true,
        },
        {
          key: 'baby_examination',
          label: 'Baby Examination',
          prompt: 'Document:\n- Growth (weight, length, HC)\n- Physical examination findings\n- Development assessment\n- Hip examination\n- Eye check\n- Heart and lungs\n- Umbilicus',
          required: true,
        },
        {
          key: 'maternal_check',
          label: 'Maternal Check',
          prompt: 'Document:\n- Mood (EPDS if done)\n- Physical recovery\n- Contraception discussion\n- Support systems',
          required: true,
        },
        {
          key: 'immunisations',
          label: 'Immunisations',
          prompt: 'Document vaccines given and any reactions',
          required: true,
        },
        {
          key: 'plan',
          label: 'Plan',
          prompt: 'Document:\n- Follow-up arrangements\n- Referrals if needed\n- Next immunisation date\n- Advice given',
          required: true,
        },
      ],
    },
  },
  {
    id: 'drivers-medical',
    name: 'Driver License Medical',
    description: 'Medical assessment for driver license',
    structure: {
      sections: [
        {
          key: 'medical_history',
          label: 'Medical History',
          prompt: 'Document relevant medical conditions, medications, substance use',
          required: true,
        },
        {
          key: 'vision_assessment',
          label: 'Vision Assessment',
          prompt: 'Document:\n- Visual acuity\n- Visual fields\n- Colour vision if required',
          required: true,
        },
        {
          key: 'physical_examination',
          label: 'Physical Examination',
          prompt: 'Document examination findings relevant to driving ability',
          required: true,
        },
        {
          key: 'fitness_assessment',
          label: 'Fitness Assessment',
          prompt: 'Document:\n- Overall fitness to drive\n- Any restrictions required\n- Period of license issued',
          required: true,
        },
        {
          key: 'plan',
          label: 'Plan',
          prompt: 'Document:\n- Medical certificate details\n- Follow-up requirements\n- Advice given',
          required: true,
        },
      ],
    },
  },
  {
    id: 'acc',
    name: 'ACC Initial',
    description: 'Initial ACC consultation for injury',
    structure: {
      sections: [
        {
          key: 'accident_details',
          label: 'Accident Details',
          prompt: 'Document:\n- Date and time of accident\n- Mechanism of injury\n- Location\n- Activity at time of injury',
          required: true,
        },
        {
          key: 'history',
          label: 'History',
          prompt: 'Document:\n- Symptoms since injury\n- Treatment so far\n- Impact on work/daily activities',
          required: true,
        },
        {
          key: 'examination',
          label: 'Examination',
          prompt: 'Document relevant physical examination findings',
          required: true,
        },
        {
          key: 'diagnosis',
          label: 'Diagnosis',
          prompt: 'Document diagnosis and READ/SNOMED code',
          required: true,
        },
        {
          key: 'work_capacity',
          label: 'Work Capacity',
          prompt: 'Document:\n- Fitness for work\n- Hours/duties limitations\n- Duration of limitations',
          required: true,
        },
        {
          key: 'treatment_plan',
          label: 'Treatment Plan',
          prompt: 'Document:\n- Treatment prescribed\n- Referrals made\n- Follow-up plan',
          required: true,
        },
      ],
    },
  },
];
