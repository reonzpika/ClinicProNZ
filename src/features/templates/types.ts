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
    };
    level: 'low' | 'medium' | 'high'; // Detail level for selected components
  };
  abbreviations: boolean;
};

// Subsection type - no optional flag allowed
export type SubsectionDSL = {
  heading: string;
  prompt: string;
};

// Section type - can have optional flag and subsections
export type SectionDSL = {
  heading: string;
  prompt: string;
  optional?: boolean; // Only sections can be optional
  subsections?: SubsectionDSL[]; // Subsections inherit parent section's optional status
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
