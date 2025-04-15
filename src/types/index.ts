export type ClinicalFinding = {
  type: 'symptom' | 'duration' | 'risk' | 'vital' | 'medication';
  text: string;
  importance: 'high' | 'medium' | 'low';
  timestamp: number;
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

export interface GeneratedNote {
  sections: Array<{
    key: string;
    content: string;
  }>;
}

export type ConciseLevel = 'detailed' | 'concise' | 'bullet-points';

export interface ConciseOption {
  id: ConciseLevel;
  name: string;
  description: string;
}
