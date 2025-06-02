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

  // DSL validation
  if (!template.dsl || typeof template.dsl !== 'object') {
    errors.push({ field: 'dsl', message: 'Template DSL is required' });
  } else {
    if (!template.dsl.sections || !Array.isArray(template.dsl.sections)) {
      errors.push({ field: 'dsl.sections', message: 'Template sections are required' });
    } else if (template.dsl.sections.length === 0) {
      errors.push({ field: 'dsl.sections', message: 'At least one section is required' });
    } else {
      // Validate each section
      template.dsl.sections.forEach((section, index) => {
        if (!section.heading) {
          errors.push({ field: `dsl.sections[${index}].heading`, message: 'Section heading is required' });
        }
        if (!section.prompt) {
          errors.push({ field: `dsl.sections[${index}].prompt`, message: 'Section prompt is required' });
        }

        // Validate subsections if they exist
        if (section.subsections && Array.isArray(section.subsections)) {
          section.subsections.forEach((subsection, subIndex) => {
            if (!subsection.heading) {
              errors.push({ field: `dsl.sections[${index}].subsections[${subIndex}].heading`, message: 'Subsection heading is required' });
            }
            if (!subsection.prompt) {
              errors.push({ field: `dsl.sections[${index}].subsections[${subIndex}].prompt`, message: 'Subsection prompt is required' });
            }
          });
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
