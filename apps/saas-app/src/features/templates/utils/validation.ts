import type { Template } from '../types';

export type ValidationError = {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'suggestion';
};

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions: ValidationError[];
};

export function validateTemplate(template: Partial<Template>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const suggestions: ValidationError[] = [];

  // Required field validation
  if (!template.name || template.name.trim() === '') {
    errors.push({
      field: 'name',
      message: 'Template name is required',
      severity: 'error',
    });
  }

  if (!template.type) {
    errors.push({
      field: 'type',
      message: 'Template type is required',
      severity: 'error',
    });
  }

  // Validate templateBody
  if (!template.templateBody) {
    errors.push({
      field: 'templateBody',
      message: 'Template body is required',
      severity: 'error',
    });
  } else if (template.templateBody.trim() === '') {
    errors.push({
      field: 'templateBody',
      message: 'Template body cannot be empty',
      severity: 'error',
    });
  } else {
    // Advanced validation for natural language templates
    const templateBody = template.templateBody;

    // Check for placeholders
    const placeholders = templateBody.match(/\[([^\]]+)\]/g) || [];
    if (placeholders.length === 0) {
      warnings.push({
        field: 'templateBody',
        message: 'No placeholders found. Consider adding [placeholder text] for dynamic content',
        severity: 'warning',
      });
    }

    // Check for anti-hallucination instructions
    const hasAntiHallucination = templateBody.toLowerCase().includes('only include')
      || templateBody.toLowerCase().includes('only if mentioned')
      || templateBody.toLowerCase().includes('explicitly mentioned');

    if (placeholders.length > 0 && !hasAntiHallucination) {
      warnings.push({
        field: 'templateBody',
        message: 'Consider adding "(only include if mentioned)" instructions to prevent AI hallucination',
        severity: 'warning',
      });
    }

    // Check for proper structure
    const lines = templateBody.split('\n');
    const hasHeaders = lines.some(line =>
      line.trim()
      && !line.startsWith('-')
      && !line.startsWith('(')
      && !line.includes('[')
      && line.trim().length > 0,
    );

    if (!hasHeaders && placeholders.length > 3) {
      suggestions.push({
        field: 'templateBody',
        message: 'Consider organizing content with section headers (e.g., HISTORY:, EXAMINATION:)',
        severity: 'suggestion',
      });
    }

    // Check for instructions/preamble
    const hasInstructions = templateBody.includes('(') && templateBody.includes(')');
    if (!hasInstructions && placeholders.length > 0) {
      suggestions.push({
        field: 'templateBody',
        message: 'Consider adding instructional text in parentheses to guide AI behaviour',
        severity: 'suggestion',
      });
    }

    // Check template length
    if (templateBody.length < 50) {
      warnings.push({
        field: 'templateBody',
        message: 'Template seems quite short. Consider adding more structure or placeholders',
        severity: 'warning',
      });
    }

    if (templateBody.length > 5000) {
      warnings.push({
        field: 'templateBody',
        message: 'Template is very long. Consider breaking it into smaller, focused templates',
        severity: 'warning',
      });
    }

    // Check for balanced brackets
    const openBrackets = (templateBody.match(/\[/g) || []).length;
    const closeBrackets = (templateBody.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      errors.push({
        field: 'templateBody',
        message: 'Unmatched brackets detected. Each [ should have a corresponding ]',
        severity: 'error',
      });
    }

    // Check for balanced parentheses in instructions
    const openParens = (templateBody.match(/\(/g) || []).length;
    const closeParens = (templateBody.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      warnings.push({
        field: 'templateBody',
        message: 'Unmatched parentheses detected. Check instruction formatting',
        severity: 'warning',
      });
    }

    // Check for common placeholder patterns
    const commonPlaceholders = [
      'patient name',
      'age',
      'presenting complaint',
      'history',
      'examination',
      'assessment',
      'plan',
      'medications',
      'allergies',
    ];

    const templateLower = templateBody.toLowerCase();
    const missingCommonFields = commonPlaceholders.filter(field =>
      !templateLower.includes(field) && placeholders.length > 5,
    );

    if (missingCommonFields.length > 3) {
      suggestions.push({
        field: 'templateBody',
        message: `Consider adding common medical fields: ${missingCommonFields.slice(0, 3).join(', ')}`,
        severity: 'suggestion',
      });
    }
  }

  // Name validation
  if (template.name && template.name.length > 100) {
    warnings.push({
      field: 'name',
      message: 'Template name is quite long. Consider a shorter, more concise name',
      severity: 'warning',
    });
  }

  // Description validation
  if (template.description && template.description.length > 500) {
    warnings.push({
      field: 'description',
      message: 'Description is very long. Consider keeping it concise',
      severity: 'warning',
    });
  }

  if (template.templateBody && template.templateBody.trim() && !template.description) {
    suggestions.push({
      field: 'description',
      message: 'Consider adding a description to help others understand when to use this template',
      severity: 'suggestion',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}
