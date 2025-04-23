export type AnalysisLevel = 'basic' | 'detailed' | 'comprehensive';
export type ConciseLevel = 'detailed' | 'concise' | 'bullet-points';

export type Problem = {
  id: string;
  type: 'primary' | 'secondary' | 'preventive';
  description: string;
  priority: number;
  soap: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
};

export type GeneratedNote = {
  sections: Array<{
    key: string;
    title: string;
    content: string;
    variables: Record<string, any>;
  }>;
  metadata: {
    templateId: string;
    analysisLevel: AnalysisLevel;
    conciseLevel: ConciseLevel;
    generatedAt: Date;
  };
};

export type TemplateVariable = {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  required: boolean;
  defaultValue: string;
  description?: string;
};

export type ProcessedVariables = Record<string, string | number | boolean | Date>;

export type NoteTemplate = {
  id: string;
  name: string;
  type: 'multi-problem' | 'specialized';
  sections: Array<{
    key: string;
    title: string;
    prompt: string;
    required: boolean;
    order: number;
  }>;
  variables: Record<string, TemplateVariable>;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type NoteGenerationConfig = {
  templateId: string;
  analysisLevel: AnalysisLevel;
  conciseLevel: ConciseLevel;
  variables?: Record<string, any>;
};

export type NoteGenerationError =
  | 'EMPTY_TRANSCRIPT'
  | 'INVALID_TEMPLATE'
  | 'MISSING_VARIABLES'
  | 'INVALID_VARIABLES'
  | 'GENERATION_FAILED'
  | 'API_ERROR';

export type NoteGenerationResult = {
  success: boolean;
  note?: GeneratedNote;
  error?: {
    type: NoteGenerationError;
    message: string;
  };
};

export type PromptConfig = {
  basePrompts: {
    clinicalContext: string;
    medicalStandards: string;
    privacy: string;
  };
  functionalPrompts: {
    inputProcessor: string;
    analysis: string;
    formatter: string;
  };
  templatePrompt: string;
};
