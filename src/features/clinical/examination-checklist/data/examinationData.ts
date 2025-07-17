import type { ExaminationType } from '../types';

export const EXAMINATION_CHECKLISTS: ExaminationType[] = [
  {
    id: 'respiratory',
    title: 'Respiratory',
    items: [
      'Chest clear to auscultation',
      'Equal air entry bilaterally',
      'No wheeze or crackles',
      'No increased work of breathing',
    ],
  },
  {
    id: 'cardiovascular',
    title: 'Cardiovascular',
    items: [
      'Heart sounds dual, no murmurs',
      'Normal capillary refill',
      'No peripheral oedema',
      'No raised JVP',
    ],
  },
  {
    id: 'abdominal',
    title: 'Abdominal',
    items: [
      'Abdomen soft, non-tender',
      'No palpable masses',
      'Bowel sounds present',
      'No organomegaly',
    ],
  },
  {
    id: 'ent',
    title: 'ENT / Throat & Neck',
    items: [
      'Throat not inflamed',
      'Tonsils normal',
      'No cervical lymphadenopathy',
      'Tympanic membranes normal',
    ],
  },
  {
    id: 'eyes',
    title: 'Eyes',
    items: [
      'Pupils equal and reactive to light',
      'Conjunctivae clear',
      'No discharge noted',
      'Visual acuity normal',
    ],
  },
  {
    id: 'neurological',
    title: 'Neurological',
    items: [
      'Cranial nerves grossly intact',
      'Normal tone, power and reflexes',
      'Gait normal',
      'No focal neurological deficit',
    ],
  },
  {
    id: 'baby-check',
    title: '6-Week Baby Check',
    items: [
      'Appears well and alert',
      'Tone and movements normal',
      'Red reflexes present bilaterally',
      'Heart sounds normal',
      'Lungs clear',
      'Abdomen soft, no masses',
      'Genitalia normal',
      'Hips stable on Barlow and Ortolani',
      'Spine and skin normal',
    ],
  },
  {
    id: 'dl9-class1',
    title: 'DL9 Class 1 (Basic Fitness Check)',
    items: [
      'Alert and oriented, no cognitive concerns',
      'Vision and hearing grossly normal',
      'No syncopal episodes or seizures',
      'No significant cardiovascular history',
      'No concerning medications noted',
      'No substance misuse concerns',
      'Physical exam unremarkable',
      'Sufficient mobility to operate vehicle safely',
      'No concerns re safe driving raised',
    ],
  },
  {
    id: 'dl9-class2',
    title: 'DL9 Class 2+ (Commercial Standard)',
    items: [
      'Cognitively intact and oriented',
      'Vision and fields meet commercial standard',
      'Hearing adequate for safe driving',
      'Cardiovascular and respiratory exams normal',
      'No blackouts, seizures, or syncope history',
      'No neurological or psychiatric conditions affecting function',
      'No substance misuse disclosed',
      'No medication side effects impacting alertness or coordination',
      'Physical function and joint mobility appropriate for vehicle operation',
      'BP within acceptable range',
      'Diabetes (if present) well controlled, no recent hypos',
    ],
  },
];
