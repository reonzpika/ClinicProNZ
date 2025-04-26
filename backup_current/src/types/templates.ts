import type { InferModel } from 'drizzle-orm';

import type { templateSchema, templateSectionSchema } from '@/models/Schema';

// Template types
export type Template = InferModel<typeof templateSchema>;
export type NewTemplate = InferModel<typeof templateSchema, 'insert'>;

// Template section types
export type TemplateSection = InferModel<typeof templateSectionSchema>;
export type NewTemplateSection = InferModel<typeof templateSectionSchema, 'insert'>;

// Template type enum
export type TemplateType = 'multi-problem' | 'specialized' | 'follow-up' | 'assessment';

// Variable types
export type TemplateVariable = {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  required: boolean;
  defaultValue: string;
  description?: string;
};

// Template with sections and variables
export type TemplateWithSections = {
  sections: TemplateSection[];
  variables: Record<string, TemplateVariable>;
  type: TemplateType;
  isSystem: boolean;
} & Template;

// Version info
export type TemplateVersion = {
  id: number;
  version: number;
  createdAt: Date;
  isLatest: boolean;
};

// Template creation/update payload
export type TemplatePayload = {
  name: string;
  description?: string;
  type: TemplateType;
  sections: {
    title: string;
    content: string;
    order: number;
  }[];
  variables?: Record<string, TemplateVariable>;
};
