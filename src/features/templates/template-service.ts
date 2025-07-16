import { eq, or } from 'drizzle-orm';

import { db } from '../../../database/client';
import { templates } from '../../../database/schema/templates';
import type { Template } from './types';

function mapDbTemplateToTemplate(dbTemplate: any): Template {
  return {
    id: dbTemplate.id,
    name: dbTemplate.name,
    description: dbTemplate.description ?? undefined,
    type: dbTemplate.type,
    ownerId: dbTemplate.ownerId ?? undefined,
    templateBody: dbTemplate.templateBody,
    createdAt: dbTemplate.createdAt instanceof Date ? dbTemplate.createdAt.toISOString() : dbTemplate.createdAt,
    updatedAt: dbTemplate.updatedAt instanceof Date ? dbTemplate.updatedAt.toISOString() : dbTemplate.updatedAt,
  };
}

export class TemplateService {
  static async create(template: Omit<Template, 'id'>): Promise<Template> {
    if (!template.templateBody || template.templateBody.trim() === '') {
      throw new Error('Template body is required');
    }

    const { createdAt, updatedAt, ...rest } = template;
    const insertData: any = {
      ...rest,
      ...(createdAt && typeof createdAt !== 'string' ? { createdAt } : {}),
      ...(updatedAt && typeof updatedAt !== 'string' ? { updatedAt } : {}),
    };

    const [newTemplate] = await db.insert(templates).values(insertData).returning();
    if (!newTemplate) {
      throw new Error('Failed to create template');
    }
    return mapDbTemplateToTemplate(newTemplate);
  }

  static async getById(id: string): Promise<Template | null> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template ? mapDbTemplateToTemplate(template) : null;
  }

  static async update(id: string, template: Partial<Template>): Promise<Template> {
    // Basic validation
    const [existing] = await db.select().from(templates).where(eq(templates.id, id));
    if (!existing) {
      throw new Error('Template not found');
    }

    // If updating templateBody, validate it's not empty
    if (template.templateBody !== undefined && template.templateBody.trim() === '') {
      throw new Error('Template body cannot be empty');
    }

    const { createdAt, updatedAt, ...rest } = template;
    const updateData: any = {
      ...rest,
      ...(createdAt && typeof createdAt !== 'string' ? { createdAt } : {}),
      ...(updatedAt && typeof updatedAt !== 'string' ? { updatedAt } : {}),
    };

    const [updatedTemplate] = await db
      .update(templates)
      .set(updateData)
      .where(eq(templates.id, id))
      .returning();
    if (!updatedTemplate) {
      throw new Error('Template not found');
    }
    return mapDbTemplateToTemplate(updatedTemplate);
  }

  static async delete(id: string): Promise<void> {
    await db.delete(templates).where(eq(templates.id, id));
  }

  static async list(userId?: string, type?: 'default' | 'custom'): Promise<Template[]> {
    let dbTemplates;

    if (type === 'default') {
      // Only default templates
      dbTemplates = await db.select().from(templates).where(eq(templates.type, 'default'));
    } else if (type === 'custom' && userId) {
      // Only custom templates for the user
      dbTemplates = await db.select().from(templates).where(eq(templates.ownerId, userId));
    } else if (userId) {
      // Default: fetch both default and custom templates for signed-in user
      dbTemplates = await db.select().from(templates).where(
        or(eq(templates.type, 'default'), eq(templates.ownerId, userId)),
      );
    } else {
      // Guests: only default templates
      dbTemplates = await db.select().from(templates).where(eq(templates.type, 'default'));
    }

    return dbTemplates.map(mapDbTemplateToTemplate);
  }
}
