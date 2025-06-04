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
    level: 'basic' | 'standard' | 'comprehensive';
  };
  abbreviations: boolean;
};

// New TemplateDSL Schema
export type SectionDSL = {
  heading: string;
  prompt: string;
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
