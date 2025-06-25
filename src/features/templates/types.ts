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

// New simplified template structure
export type Template = {
  id: string;
  name: string;
  description?: string;
  type: 'default' | 'custom';
  ownerId?: string;
  templateBody: string; // Natural language template with placeholders
  createdAt?: string;
  updatedAt?: string;
};

// AI Template Generation Response
export type TemplateGenerationResponse = {
  title: string;
  description: string;
  templateBody: string; // Natural language template
};

export type ApiError = {
  code: string;
  message: string;
  field?: string;
};
