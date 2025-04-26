import type { IconName } from '@/types/icons';

export type AnalysisLevelId = 'facts' | 'basic' | 'clinical';

export type AnalysisLevel = {
  id: AnalysisLevelId;
  label: string;
  description: string;
  icon?: IconName;
  features: string[];
};

export const analysisLevels: AnalysisLevel[] = [
  {
    id: 'facts',
    label: 'Facts Only',
    description: 'Pure information extraction and basic organization',
    icon: 'clipboard',
    features: [
      'Extract explicit information',
      'Basic organization by problem',
      'No clinical interpretation',
      'Direct symptom mapping',
    ],
  },
  {
    id: 'basic',
    label: 'Basic Analysis',
    description: 'Pattern recognition and basic clinical correlations',
    icon: 'search',
    features: [
      'Pattern recognition',
      'Basic clinical correlations',
      'Standard care pathways',
      'Common risk factors',
    ],
  },
  {
    id: 'clinical',
    label: 'Clinical Insights',
    description: 'Evidence-based suggestions and risk assessment',
    icon: 'stethoscope',
    features: [
      'Evidence-based suggestions',
      'Risk stratification',
      'Differential diagnoses',
      'Management options',
    ],
  },
];
