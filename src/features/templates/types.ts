export enum SectionType {
  TEXT = 'text',
  ARRAY = 'array',
}

export type Section = {
  id: string;
  name: string;
  type: SectionType;
  description: string;
  prompt: string;
  required?: boolean;
};

export type TemplateMetadata = {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
  lastUpdated: string;
};

export type TemplateSection = {
  name: string;
  type: 'text' | 'array';
  required: boolean;
  description: string;
  subsections?: TemplateSection[];
};

export type TemplatePrompts = {
  system: string;
  structure: string;
  example?: string;
};

export type Template = {
  id: string;
  name: string;
  type: 'default' | 'custom';
  ownerId?: string;
  sections: TemplateSection[];
  prompts: TemplatePrompts;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiError = {
  code: string;
  message: string;
  field?: string;
};
