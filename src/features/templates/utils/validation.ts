// TODO: Remove this file if not used. All section, sections, and subsection validation logic has been removed.

import type { Template } from '../types';

export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
};

export function validateTemplate(template: Template): ValidationResult {
  const errors: ValidationError[] = [];

  // Top-level required fields
  if (!template.name) {
    errors.push({ field: 'name', message: 'Template name is required' });
  }
  // description is optional
  if (!template.type) {
    errors.push({ field: 'type', message: 'Template type is required' });
  } else if (template.type !== 'default' && template.type !== 'custom') {
    errors.push({ field: 'type', message: 'Template type must be "default" or "custom"' });
  }

  // Prompts validation
  if (!template.prompts || typeof template.prompts !== 'object') {
    errors.push({ field: 'prompts', message: 'Template prompts are required' });
  } else {
    if (!template.prompts.prompt) {
      errors.push({ field: 'prompts.prompt', message: 'Prompt is required' });
    } else if (template.prompts.prompt.length > 1000) {
      errors.push({ field: 'prompts.prompt', message: 'Prompt must be at most 1000 characters' });
    }
    // example is optional
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
