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

export type Template = {
  id: string;
  name: string;
  description?: string;
  type: 'default' | 'custom';
  ownerId?: string;
  prompts: {
    prompt: string;
    example?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type ApiError = {
  code: string;
  message: string;
  field?: string;
};
