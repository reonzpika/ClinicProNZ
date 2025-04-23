import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { templateSectionSchema } from '@/models/Schema';
import type { NewTemplateSection, TemplateSection } from '@/types/templates';

export class TemplateSectionService {
  /**
   * Create a new template section
   */
  static async create(section: NewTemplateSection): Promise<TemplateSection> {
    const [created] = await db.insert(templateSectionSchema)
      .values(section)
      .returning();

    return created;
  }

  /**
   * Create multiple template sections
   */
  static async createMany(sections: NewTemplateSection[]): Promise<TemplateSection[]> {
    if (!sections.length) {
      return [];
    }

    return db.insert(templateSectionSchema)
      .values(sections)
      .returning();
  }

  /**
   * Get all sections for a template
   */
  static async getAllByTemplateId(templateId: number): Promise<TemplateSection[]> {
    return db.select()
      .from(templateSectionSchema)
      .where(eq(templateSectionSchema.templateId, templateId))
      .orderBy(templateSectionSchema.order);
  }

  /**
   * Update a template section
   */
  static async update(id: number, section: Partial<TemplateSection>): Promise<TemplateSection> {
    const [updated] = await db.update(templateSectionSchema)
      .set(section)
      .where(eq(templateSectionSchema.id, id))
      .returning();

    return updated;
  }

  /**
   * Delete a template section
   */
  static async delete(id: number): Promise<void> {
    await db.delete(templateSectionSchema)
      .where(eq(templateSectionSchema.id, id));
  }

  /**
   * Reorder template sections
   */
  static async reorder(templateId: number, sectionIds: number[]): Promise<void> {
    // Update order for each section
    await Promise.all(
      sectionIds.map((id, index) =>
        db.update(templateSectionSchema)
          .set({ order: index })
          .where(eq(templateSectionSchema.id, id)),
      ),
    );
  }

  /**
   * Clone sections from one template to another
   */
  static async cloneFromTemplate(sourceTemplateId: number, targetTemplateId: number): Promise<TemplateSection[]> {
    // Get sections from source template
    const sections = await this.getAllByTemplateId(sourceTemplateId);

    if (!sections.length) {
      return [];
    }

    // Create new sections for target template
    return this.createMany(
      sections.map(section => ({
        ...section,
        id: undefined, // Let DB generate new ID
        templateId: targetTemplateId,
      })),
    );
  }
}
