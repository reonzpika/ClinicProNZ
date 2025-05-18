import { db } from '../../../database/client';
import { templates } from '../../../database/schema/templates';
import { eq } from 'drizzle-orm';
import { validateTemplate } from './utils/validation';
import type { Template } from './types';

export class TemplateService {
  static async create(template: Omit<Template, 'id'>): Promise<Template> {
    if (!template.prompts || !template.prompts.prompt) {
      throw new Error('Template prompt is required');
    }

    const [newTemplate] = await db.insert(templates).values(template).returning();
    return newTemplate;
  }

  static async getById(id: string): Promise<Template | null> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || null;
  }

  static async update(id: string, template: Partial<Template>): Promise<Template> {
    // If updating fields that affect validation, validate the merged template
    const [existing] = await db.select().from(templates).where(eq(templates.id, id));
    if (!existing) throw new Error('Template not found');
    const merged = { ...existing, ...template };
    if (!merged.prompts || !merged.prompts.prompt) {
      throw new Error('Template prompt is required');
    }
    const [updatedTemplate] = await db
      .update(templates)
      .set(template)
      .where(eq(templates.id, id))
      .returning();
    if (!updatedTemplate) {
      throw new Error('Template not found');
    }
    return updatedTemplate;
  }

  static async delete(id: string): Promise<void> {
    await db.delete(templates).where(eq(templates.id, id));
  }

  static async list(userId?: string, type?: 'default' | 'custom'): Promise<Template[]> {
    // If type is specified, filter by type; otherwise, return all for user
    if (type) {
      if (type === 'default') {
        return db.select().from(templates).where(eq(templates.type, 'default'));
      } else if (type === 'custom' && userId) {
        return db.select().from(templates).where(eq(templates.ownerId, userId));
      }
    }
    // Default: fetch both default and custom for signed-in user, or just default for guests
    if (userId) {
      return db.select().from(templates).where(eq(templates.ownerId, userId));
    }
    return db.select().from(templates).where(eq(templates.type, 'default'));
  }

  // No more section/structure validation needed
}
