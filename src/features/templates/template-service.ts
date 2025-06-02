import { eq } from 'drizzle-orm';

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
    dsl: dbTemplate.dsl,
    createdAt: dbTemplate.createdAt instanceof Date ? dbTemplate.createdAt.toISOString() : dbTemplate.createdAt,
    updatedAt: dbTemplate.updatedAt instanceof Date ? dbTemplate.updatedAt.toISOString() : dbTemplate.updatedAt,
  };
}

export class TemplateService {
  static async create(template: Omit<Template, 'id'>): Promise<Template> {
    if (!template.dsl || !template.dsl.sections || template.dsl.sections.length === 0) {
      throw new Error('Template DSL with at least one section is required');
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
    // If updating fields that affect validation, validate the merged template
    const [existing] = await db.select().from(templates).where(eq(templates.id, id));
    if (!existing) {
      throw new Error('Template not found');
    }
    const merged = { ...mapDbTemplateToTemplate(existing), ...template };
    if (!merged.dsl || !merged.dsl.sections || merged.dsl.sections.length === 0) {
      throw new Error('Template DSL with at least one section is required');
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
    if (type) {
      if (type === 'default') {
        dbTemplates = await db.select().from(templates).where(eq(templates.type, 'default'));
      } else if (type === 'custom' && userId) {
        dbTemplates = await db.select().from(templates).where(eq(templates.ownerId, userId));
      }
    }
    // Default: fetch both default and custom for signed-in user, or just default for guests
    if (!dbTemplates) {
      if (userId) {
        dbTemplates = await db.select().from(templates).where(eq(templates.ownerId, userId));
      } else {
        dbTemplates = await db.select().from(templates).where(eq(templates.type, 'default'));
      }
    }
    return dbTemplates.map(mapDbTemplateToTemplate);
  }

  // No more section/structure validation needed
}
