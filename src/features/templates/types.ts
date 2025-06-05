export type TemplateMetadata = {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
  lastUpdated: string;
};

export type TemplatePrompts = {
  structure: string;
  example?: string;
};

// Template Settings for session-level control
export type TemplateSettings = {
  detailLevel: 'low' | 'medium' | 'high';
  bulletPoints: boolean;
  aiAnalysis: {
    enabled: boolean;
    components: {
      differentialDiagnosis: boolean;
      assessmentSummary: boolean;
      managementPlan: boolean;
      redFlags: boolean;
      investigations: boolean;
      followUp: boolean;
    };
    level: 'low' | 'medium' | 'high'; // Detail level for selected components
  };
  abbreviations: boolean;
};

// New TemplateDSL Schema
export type SectionDSL = {
  heading: string;
  prompt: string;
  optional?: boolean;
  subsections?: SectionDSL[];
};

export type TemplateDSL = {
  overallInstructions?: string;
  sections: SectionDSL[]; // non-empty array
  settings?: TemplateSettings;
};

// AI Template Generation Response
export type TemplateGenerationResponse = {
  title: string;
  description: string;
  dsl: TemplateDSL;
};

export type Template = {
  id: string;
  name: string;
  description?: string;
  type: 'default' | 'custom';
  ownerId?: string;
  dsl: TemplateDSL; // Changed from prompts to dsl
  createdAt?: string;
  updatedAt?: string;
};

export type ApiError = {
  code: string;
  message: string;
  field?: string;
};
