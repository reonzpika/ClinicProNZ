import type { Template, TemplateSection } from '../types';

export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
};

// Validate a single section (and its subsections recursively)
function validateSection(section: TemplateSection, path: string = ''): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!section.name) {
    errors.push({ field: `${path}name`, message: 'Section name is required' });
  }
  if (!section.type) {
    errors.push({ field: `${path}type`, message: 'Section type is required' });
  } else if (section.type !== 'text' && section.type !== 'array') {
    errors.push({ field: `${path}type`, message: 'Section type must be "text" or "array"' });
  }
  if (typeof section.required !== 'boolean') {
    errors.push({ field: `${path}required`, message: 'Section required must be a boolean' });
  }
  // description is now optional, so no validation for it
  if (!section.prompt) {
    errors.push({ field: `${path}prompt`, message: 'Section prompt is required' });
  }

  if (section.subsections) {
    section.subsections.forEach((sub, idx) => {
      errors.push(...validateSection(sub, `${path}subsections[${idx}].`));
    });
  }

  return errors;
}

// Main validation function
export function validateTemplate(template: Template): ValidationResult {
  const errors: ValidationError[] = [];

  // Top-level required fields
  if (!template.name) {
    errors.push({ field: 'name', message: 'Template name is required' });
  }
  // description is now optional
  if (!template.type) {
    errors.push({ field: 'type', message: 'Template type is required' });
  } else if (template.type !== 'default' && template.type !== 'custom') {
    errors.push({ field: 'type', message: 'Template type must be "default" or "custom"' });
  }
  // sections is now optional
  if (template.sections) {
    if (!Array.isArray(template.sections)) {
      errors.push({ field: 'sections', message: 'Sections must be an array' });
    } else if (template.sections.length > 20) {
      errors.push({ field: 'sections', message: 'Template cannot have more than 20 sections' });
    } else {
      template.sections.forEach((section, idx) => {
        errors.push(...validateSection(section, `sections[${idx}].`));
      });
    }
  }

  // Prompts validation
  if (!template.prompts || typeof template.prompts !== 'object') {
    errors.push({ field: 'prompts', message: 'Template prompts are required' });
  } else {
    if (!template.prompts.structure) {
      errors.push({ field: 'prompts.structure', message: 'Structure prompt is required' });
    } else if (template.prompts.structure.length > 1000) {
      errors.push({ field: 'prompts.structure', message: 'Structure prompt must be at most 1000 characters' });
    }
    // example is optional
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
