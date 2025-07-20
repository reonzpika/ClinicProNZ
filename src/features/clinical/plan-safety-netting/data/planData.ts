import type { PlanCategory } from '../types';

export const PLAN_CATEGORIES: PlanCategory[] = [
  {
    id: 'management',
    title: 'Management',
    items: [
      'Provided self-care advice',
      'Discussed red flags',
      'Patient education provided',
      'Lifestyle modifications discussed',
      'Medication compliance reviewed',
      'Written information provided',
      'Referral arranged',
      'Investigation ordered',
    ],
  },
  {
    id: 'followup',
    title: 'Follow-up',
    items: [
      'F/U in 1 week',
      'F/U in 2 weeks',
      'F/U in 4 weeks',
      'F/U in 3 months',
      'F/U in 6 months',
      'Routine review scheduled',
      'PRN basis',
      'Phone review arranged',
      'Nurse appointment booked',
    ],
  },
  {
    id: 'safety-netting',
    title: 'Safety-netting',
    items: [
      'Advised to represent if symptoms worsen',
      'Return if no improvement in 48-72 hours',
      'Return if new symptoms develop',
      'Seek urgent care if red flags develop',
      'Contact practice if concerns',
      'Emergency services if severe deterioration',
      'Written safety-netting advice provided',
      'Discussed when to seek further help',
    ],
  },
];
