'use server';

import { TemplateService } from '@/services/template.service';
import type { NewTemplate, Template, TemplatePayload, TemplateWithSections } from '@/types/templates';

/**
 * Server action for fetching templates
 */
export async function fetchTemplates(userId: string): Promise<Template[]> {
  return TemplateService.getAllByUserId(userId);
}

/**
 * Server action for creating a new template
 */
export async function createTemplate(template: TemplatePayload): Promise<Template> {
  const newTemplate: NewTemplate = {
    ...template,
    content: '', // Will be generated from sections
    structure: {}, // Will be generated from sections
    variables: template.variables || {},
    isSystem: false,
    isLatest: true,
    version: 1,
    isActive: true,
  };
  return TemplateService.create(newTemplate);
}

/**
 * Server action for getting a template by ID
 */
export async function getTemplateById(id: number): Promise<Template | null> {
  return TemplateService.getById(id);
}

/**
 * Server action for getting a template with its sections
 */
export async function getTemplateWithSections(id: number): Promise<TemplateWithSections | null> {
  return TemplateService.getWithSections(id);
}

/**
 * Server action for getting all system templates
 */
export async function getSystemTemplates(): Promise<Template[]> {
  return TemplateService.getSystemTemplates();
}

/**
 * Server action for copying a system template to user's templates
 */
export async function copySystemTemplate(templateId: number, userId: string): Promise<Template> {
  return TemplateService.copySystemTemplate(templateId, userId);
}

/**
 * Server action for updating a template
 */
export async function updateTemplate(
  id: number,
  template: Partial<TemplatePayload>,
  createNewVersion = false,
): Promise<Template> {
  const updateData: Partial<Template> = {
    ...template,
    content: template.sections ? '' : undefined, // Will be generated from sections if provided
    structure: template.sections ? {} : undefined, // Will be generated from sections if provided
    variables: template.variables,
  };
  return TemplateService.update(id, updateData, createNewVersion);
}

/**
 * Server action for deleting a template
 */
export async function deleteTemplate(id: number): Promise<void> {
  return TemplateService.delete(id);
}

/**
 * Server action for getting all versions of a template
 */
export async function getTemplateVersions(id: number): Promise<Template[]> {
  return TemplateService.getVersions(id);
}

/**
 * Server action for getting all templates with sections for a user
 */
export async function getAllTemplatesWithSections(userId: string): Promise<TemplateWithSections[]> {
  return TemplateService.getAllWithSectionsByUserId(userId);
}
