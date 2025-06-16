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
  aiAnalysis: {
    enabled: boolean;
    components: {
      differentialDiagnosis: boolean;
      managementPlan: boolean;
    };
    level: 'low' | 'medium' | 'high'; // Detail level for selected components
  };
};

// Subsection type - no optional flag allowed
export type SubsectionDSL = {
  heading: string;
  prompt: string;
};

// Section type - can have subsections
export type SectionDSL = {
  heading: string;
  prompt: string;
  subsections?: SubsectionDSL[];
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
