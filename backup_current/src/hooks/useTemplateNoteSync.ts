import { useCallback, useEffect, useState } from 'react';

import { toast } from '@/components/ui/use-toast';
import type { Template, TemplateVariable } from '@/types/templates';

type TemplateSyncConfig = {
  template: Template;
  variables: Record<string, any>;
  sections: {
    id: number;
    visible: boolean;
    order: number;
  }[];
};

type ValidationError = {
  field: string;
  message: string;
};

type SyncState = {
  isValid: boolean;
  errors: ValidationError[];
  missingRequired: string[];
  invalidFields: string[];
};

export function useTemplateNoteSync(config?: TemplateSyncConfig) {
  const [syncState, setSyncState] = useState<SyncState>({
    isValid: false,
    errors: [],
    missingRequired: [],
    invalidFields: [],
  });

  // Validate variables against template requirements
  const validateVariables = useCallback((
    variables: Record<string, any>,
    templateVariables: Record<string, TemplateVariable>,
  ) => {
    const errors: ValidationError[] = [];
    const missingRequired: string[] = [];
    const invalidFields: string[] = [];

    Object.entries(templateVariables).forEach(([name, variable]) => {
      const value = variables[name];

      // Check required fields
      if (variable.required && (value === undefined || value === '')) {
        missingRequired.push(name);
        errors.push({
          field: name,
          message: `${variable.label} is required`,
        });
      }

      // Validate value types
      if (value !== undefined && value !== '') {
        switch (variable.type) {
          case 'number':
            if (isNaN(Number(value))) {
              invalidFields.push(name);
              errors.push({
                field: name,
                message: `${variable.label} must be a number`,
              });
            }
            break;
          case 'date':
            if (isNaN(Date.parse(value))) {
              invalidFields.push(name);
              errors.push({
                field: name,
                message: `${variable.label} must be a valid date`,
              });
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              invalidFields.push(name);
              errors.push({
                field: name,
                message: `${variable.label} must be true or false`,
              });
            }
            break;
        }
      }
    });

    return {
      errors,
      missingRequired,
      invalidFields,
      isValid: errors.length === 0,
    };
  }, []);

  // Validate section configuration
  const validateSections = useCallback((
    sections: { id: number; visible: boolean; order: number }[],
    templateSections: Template['sections'],
  ) => {
    const errors: ValidationError[] = [];

    // Check if at least one section is visible
    const hasVisibleSection = sections.some(s => s.visible);
    if (!hasVisibleSection) {
      errors.push({
        field: 'sections',
        message: 'At least one section must be visible',
      });
    }

    // Check for valid section IDs and order
    const validSectionIds = new Set(templateSections.map(s => s.id));
    sections.forEach((section) => {
      if (!validSectionIds.has(section.id)) {
        errors.push({
          field: `section_${section.id}`,
          message: `Invalid section ID: ${section.id}`,
        });
      }
    });

    return errors;
  }, []);

  // Update sync state when config changes
  useEffect(() => {
    if (!config) {
      setSyncState({
        isValid: false,
        errors: [],
        missingRequired: [],
        invalidFields: [],
      });
      return;
    }

    const { template, variables, sections } = config;

    // Validate variables
    const variableValidation = validateVariables(variables, template.variables);

    // Validate sections
    const sectionErrors = validateSections(sections, template.sections);

    // Combine all validation results
    const allErrors = [...variableValidation.errors, ...sectionErrors];

    setSyncState({
      isValid: allErrors.length === 0,
      errors: allErrors,
      missingRequired: variableValidation.missingRequired,
      invalidFields: variableValidation.invalidFields,
    });

    // Show toast for validation errors
    if (allErrors.length > 0) {
      toast({
        title: 'Validation Errors',
        description: allErrors.map(error => error.message).join('\n'),
        variant: 'destructive',
      });
    }
  }, [config, validateVariables, validateSections]);

  // Get validation status for a specific field
  const getFieldValidation = useCallback((fieldName: string) => {
    return {
      isValid: !syncState.invalidFields.includes(fieldName)
        && !syncState.missingRequired.includes(fieldName),
      error: syncState.errors.find(e => e.field === fieldName)?.message,
    };
  }, [syncState]);

  return {
    ...syncState,
    getFieldValidation,
  };
}
