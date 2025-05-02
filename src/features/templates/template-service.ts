import { db } from '@/database/client';
import { templates } from '@/database/schema/templates';
import { eq } from 'drizzle-orm';
import { validateTemplate } from './utils/validation';
import type { Section, Template } from './types';

export class TemplateService {
  static async create(template: Omit<Template, 'id'>): Promise<Template> {
    const validation = validateTemplate(template as Template);
    if (!validation.isValid) {
      throw new Error(`Invalid template: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const [newTemplate] = await db.insert(templates).values(template).returning();
    return newTemplate;
  }

  static async getById(id: string): Promise<Template | null> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || null;
  }

  static async update(id: string, template: Partial<Template>): Promise<Template> {
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

  static async list(userId: string): Promise<Template[]> {
    return db.select().from(templates).where(eq(templates.ownerId, userId));
  }

  // Get templates by category
  async getTemplatesByCategory(category: string): Promise<Template[]> {
    return db
      .select()
      .from(templates)
      .where(eq(templates.metadata.category, category));
  }

  // Get templates by tag
  async getTemplatesByTag(tag: string): Promise<Template[]> {
    return db
      .select()
      .from(templates)
      .where(eq(templates.metadata.tags, tag));
  }

  // Validate template structure
  validateTemplate(template: Template): boolean {
    // Check required sections
    const sectionNames = template.structure.sections.map(section => section.name);
    const missingRequiredSections = template.structure.requiredSections.filter(
      required => !sectionNames.includes(required),
    );

    if (missingRequiredSections.length > 0) {
      console.error(`Missing required sections: ${missingRequiredSections.join(', ')}`);
      return false;
    }

    // Validate section structure
    const validateSection = (section: Section): boolean => {
      if (!section.name || !section.type || !section.description || !section.prompt) {
        return false;
      }

      if (section.subsections) {
        return section.subsections.every(validateSection);
      }

      return true;
    };

    return template.structure.sections.every(validateSection);
  }
}
