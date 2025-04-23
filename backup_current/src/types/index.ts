export type PresentingComplaint = {
  description: string;
  explored: boolean;
  priority: 'urgent' | 'routine';
};

export type RedFlag = {
  symptom: string;
  reasoning: string;
  urgency: 'immediate' | 'urgent';
};

export type SignificantPoint = {
  type: 'pmhx' | 'allergy' | 'social' | 'family' | 'other';
  description: string;
};

export type Action = {
  action: string;
  rationale: string;
  status: 'done' | 'pending';
};

export type ActionsToConsider = {
  examinations: Action[];
  investigations: Action[];
  management: Action[];
  referrals: Action[];
};

export type PatientAgendaItem = {
  description: string;
  priority: 'urgent' | 'routine';
  type: 'symptom' | 'request' | 'other';
};

export type AnalysisResult = {
  patientAgenda: PatientAgendaItem[];
  redFlags: RedFlag[];
  significantPoints: SignificantPoint[];
};

// New types for note templates
export type NoteSection = {
  key: string;
  label: string;
  prompt: string;
  required: boolean;
};

export type NoteTemplate = {
  id: string;
  name: string;
  description: string;
  structure: {
    sections: NoteSection[];
  };
};

export type GeneratedNote = {
  sections: Array<{
    key: string;
    content: string;
  }>;
};

export type ConciseLevel = 'detailed' | 'concise' | 'bullet-points';

export type ConciseOption = {
  id: ConciseLevel;
  name: string;
  description: string;
};
