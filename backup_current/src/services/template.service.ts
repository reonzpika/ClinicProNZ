import { and, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { templateSchema, templateSectionSchema } from '@/models/Schema';
import type { NewTemplate, Template, TemplateSection, TemplateWithSections } from '@/types/templates';

export class TemplateService {
  /**
   * Create a new template
   */
  static async create(template: NewTemplate): Promise<Template> {
    const [created] = await db.insert(templateSchema)
      .values({
        ...template,
        version: 1,
        isLatest: true,
      })
      .returning();

    return created as Template;
  }

  /**
   * Get a template by ID
   */
  static async getById(id: number): Promise<Template | null> {
    const [template] = await db.select()
      .from(templateSchema)
      .where(eq(templateSchema.id, id))
      .limit(1);

    return template as Template | null;
  }

  /**
   * Get a template with its sections
   */
  static async getWithSections(id: number): Promise<TemplateWithSections | null> {
    const template = await this.getById(id);
    if (!template) {
      return null;
    }

    const sections = await db.select()
      .from(templateSectionSchema)
      .where(eq(templateSectionSchema.templateId, id))
      .orderBy(templateSectionSchema.order);

    return {
      ...template,
      sections: sections as TemplateSection[],
      variables: template.variables as Record<string, any>,
      type: template.type,
      isSystem: template.isSystem,
    };
  }

  /**
   * Get all templates for a user
   */
  static async getAllByUserId(userId: string): Promise<Template[]> {
    const templates = await db.select()
      .from(templateSchema)
      .where(
        and(
          eq(templateSchema.userId, userId),
          eq(templateSchema.isLatest, true),
        ),
      );

    return templates as Template[];
  }

  /**
   * Get all system templates
   */
  static async getSystemTemplates(): Promise<Template[]> {
    const templates = await db.select()
      .from(templateSchema)
      .where(
        and(
          eq(templateSchema.userId, 'system'),
          eq(templateSchema.isLatest, true),
        ),
      );

    return templates as Template[];
  }

  /**
   * Copy a system template to user's templates
   */
  static async copySystemTemplate(templateId: number, userId: string): Promise<Template> {
    const template = await this.getWithSections(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Create new template for user
    const [newTemplate] = await db.insert(templateSchema)
      .values({
        ...template,
        id: undefined,
        userId,
        version: 1,
        isLatest: true,
      })
      .returning();

    // Copy sections
    if (template.sections.length > 0) {
      await db.insert(templateSectionSchema)
        .values(
          template.sections.map(section => ({
            ...section,
            id: undefined,
            templateId: newTemplate.id,
          })),
        );
    }

    return newTemplate as Template;
  }

  /**
   * Update a template
   * Creates a new version if specified
   */
  static async update(id: number, template: Partial<Template>, createNewVersion = false): Promise<Template> {
    if (createNewVersion) {
      // Get current template
      const current = await this.getById(id);
      if (!current) {
        throw new Error('Template not found');
      }

      // Set current version as not latest
      await db.update(templateSchema)
        .set({ isLatest: false })
        .where(eq(templateSchema.id, id));

      // Create new version
      const [newVersion] = await db.insert(templateSchema)
        .values({
          ...current,
          ...template,
          id: undefined, // Let DB generate new ID
          version: current.version + 1,
          isLatest: true,
        })
        .returning();

      return newVersion as Template;
    }

    // Simple update
    const [updated] = await db.update(templateSchema)
      .set(template)
      .where(eq(templateSchema.id, id))
      .returning();

    if (!updated) {
      throw new Error('Template not found');
    }

    return updated as Template;
  }

  /**
   * Delete a template and its sections
   */
  static async delete(id: number): Promise<void> {
    // Delete sections first due to foreign key constraint
    await db.delete(templateSectionSchema)
      .where(eq(templateSectionSchema.templateId, id));

    await db.delete(templateSchema)
      .where(eq(templateSchema.id, id));
  }

  /**
   * Get all versions of a template
   */
  static async getVersions(id: number): Promise<Template[]> {
    const template = await this.getById(id);
    if (!template) {
      throw new Error('Template not found');
    }

    // Get all versions with the same name and userId
    const templates = await db.select()
      .from(templateSchema)
      .where(
        and(
          eq(templateSchema.name, template.name),
          eq(templateSchema.userId, template.userId),
        ),
      )
      .orderBy(templateSchema.version);

    return templates as Template[];
  }

  /**
   * Get all templates with sections for a user
   */
  static async getAllWithSectionsByUserId(userId: string): Promise<TemplateWithSections[]> {
    const templates = await this.getAllByUserId(userId);

    // Get sections for each template
    const templatesWithSections = await Promise.all(
      templates.map(async (template) => {
        const sections = await db.select()
          .from(templateSectionSchema)
          .where(eq(templateSectionSchema.templateId, template.id))
          .orderBy(templateSectionSchema.order);

        return {
          ...template,
          sections: sections as TemplateSection[],
          variables: template.variables as Record<string, any>,
          type: template.type,
          isSystem: template.isSystem,
        };
      }),
    );

    return templatesWithSections;
  }
}
