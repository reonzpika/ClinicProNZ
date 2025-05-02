import type { Template, Section, SectionType } from '../types';

export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
};

// Validate a single section
function validateSection(section: Section, path: string = ''): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  if (!section.name) {
    errors.push({ field: `${path}name`, message: 'Section name is required' });
  }
  if (!section.type) {
    errors.push({ field: `${path}type`, message: 'Section type is required' });
  }
  if (!section.description) {
    errors.push({ field: `${path}description`, message: 'Section description is required' });
  }
  if (!section.prompt) {
    errors.push({ field: `${path}prompt`, message: 'Section prompt is required' });
  }

  // Type validation
  if (section.type && !Object.values(SectionType).includes(section.type)) {
    errors.push({ field: `${path}type`, message: `Section type must be one of: ${Object.values(SectionType).join(', ')}` });
  }

  return errors;
}

// Main validation function
export function validateTemplate(template: Template): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate sections
  if (!template.structure.sections || template.structure.sections.length === 0) {
    errors.push({ field: 'sections', message: 'Template must have at least one section' });
  } else {
    template.structure.sections.forEach((section, index) => {
      const sectionErrors = validateSection(section, `sections[${index}].`);
      errors.push(...sectionErrors);
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
