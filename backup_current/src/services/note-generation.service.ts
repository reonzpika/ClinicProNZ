import { eq } from 'drizzle-orm';

import { NOTE_TEMPLATES } from '@/config/noteTemplates';
import { db } from '@/db';
import { templateSchema } from '@/models/Schema';
import type {
  AnalysisLevel,
  ConciseLevel,
  GeneratedNote,
  NoteGenerationConfig,
  NoteGenerationError,
  NoteGenerationResult,
  NoteTemplate,
  ProcessedVariables,
  PromptConfig,
  TemplateVariable,
} from '@/types/note-generation';

import { AIProcessingService } from './ai-processing.service';
import { PromptConfigService } from './prompt-config.service';

export class NoteGenerationService {
  private static instance: NoteGenerationService;
  private promptConfigService: PromptConfigService;
  private aiService: AIProcessingService;

  private constructor() {
    this.promptConfigService = PromptConfigService.getInstance();
    this.aiService = AIProcessingService.getInstance();
  }

  public static getInstance(): NoteGenerationService {
    if (!NoteGenerationService.instance) {
      NoteGenerationService.instance = new NoteGenerationService();
    }
    return NoteGenerationService.instance;
  }

  async generateStructuredNote(
    transcript: string,
    config: NoteGenerationConfig,
  ): Promise<NoteGenerationResult> {
    try {
      if (!transcript?.trim()) {
        return this.createError('EMPTY_TRANSCRIPT', 'Transcript cannot be empty');
      }

      // First try database, then fallback to NOTE_TEMPLATES
      let template = await this.loadTemplateWithSections(config.templateId);

      if (!template) {
        const fallbackTemplate = NOTE_TEMPLATES.find(t => t.id === config.templateId);
        if (!fallbackTemplate) {
          return this.createError('INVALID_TEMPLATE', 'Template not found');
        }
        template = this.convertLegacyTemplate(fallbackTemplate);
      }

      // Get prompts configuration
      const promptConfig = await this.promptConfigService.getConfig();

      // Generate initial note structure
      const note: GeneratedNote = {
        sections: template.sections.map(section => ({
          key: section.key,
          title: section.title,
          content: '',
          variables: {},
        })),
        metadata: {
          templateId: template.id,
          analysisLevel: config.analysisLevel,
          conciseLevel: config.conciseLevel,
          generatedAt: new Date(),
        },
      };

      // Process variables if provided
      if (config.variables) {
        const processedVariables = await this.processVariables(
          template.variables,
          config.variables,
        );

        if ('error' in processedVariables) {
          return this.createError('INVALID_VARIABLES', processedVariables.error);
        }

        // Assign processed variables to respective sections
        note.sections = note.sections.map(section => ({
          ...section,
          variables: this.extractSectionVariables(processedVariables, section.key),
        }));
      }

      // Apply analysis level
      await this.applyAnalysisLevel(note, config.analysisLevel, promptConfig);

      // Format content based on conciseness level
      await this.formatNoteContent(note, config.conciseLevel, promptConfig);

      return {
        success: true,
        note,
      };
    } catch (error: unknown) {
      console.error('Note generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return this.createError(
        'GENERATION_FAILED',
        `Failed to generate note: ${errorMessage}`,
      );
    }
  }

  private convertLegacyTemplate(legacyTemplate: any): NoteTemplate {
    return {
      id: legacyTemplate.id,
      name: legacyTemplate.name,
      type: legacyTemplate.type as 'multi-problem' | 'specialized',
      sections: legacyTemplate.sections.map((section: any, index: number) => ({
        key: section.key || `section-${index}`,
        title: section.title,
        prompt: section.prompt || '',
        required: true,
        order: index,
      })),
      variables: {},
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  private async loadTemplateWithSections(templateId: string): Promise<NoteTemplate | null> {
    try {
      const template = await db.query.templateSchema.findFirst({
        where: eq(templateSchema.id, templateId),
        with: {
          sections: true,
        },
      });

      if (!template) {
        return null;
      }

      return {
        ...template,
        sections: template.sections.sort((a, b) => a.order - b.order),
      } as NoteTemplate;
    } catch (error) {
      console.error('Error loading template:', error);
      return null;
    }
  }

  private async processVariables(
    templateVariables: Record<string, TemplateVariable>,
    inputVariables: Record<string, any>,
  ): Promise<ProcessedVariables | { error: string }> {
    const processed: ProcessedVariables = {};

    for (const [key, variable] of Object.entries(templateVariables)) {
      const value = inputVariables[key] ?? variable.defaultValue;

      if (variable.required && !value) {
        return { error: `Required variable ${key} is missing` };
      }

      try {
        processed[key] = this.convertVariableType(value, variable.type);
      } catch (error) {
        return { error: `Invalid value for variable ${key}: ${error.message}` };
      }
    }

    return processed;
  }

  private convertVariableType(
    value: any,
    type: TemplateVariable['type'],
  ): string | number | boolean | Date {
    if (value === null || value === undefined) {
      return '';
    }

    switch (type) {
      case 'text':
        return String(value);
      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          throw new TypeError('Invalid number');
        }
        return num;
      case 'boolean':
        return Boolean(value);
      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new TypeError('Invalid date');
        }
        return date;
      default:
        return String(value);
    }
  }

  private extractSectionVariables(
    variables: ProcessedVariables,
    sectionKey: string,
  ): Record<string, any> {
    return Object.entries(variables)
      .filter(([key]) => key.startsWith(sectionKey))
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, any>);
  }

  private async applyAnalysisLevel(
    note: GeneratedNote,
    level: AnalysisLevel,
    promptConfig: PromptConfig,
  ): Promise<void> {
    note.metadata.analysisLevel = level;

    const baseContext = this.buildBaseContext(promptConfig);

    for (const section of note.sections) {
      const analysisPrompt = this.buildAnalysisPrompt(
        section,
        level,
        promptConfig,
        baseContext,
      );

      try {
        const processedContent = await this.aiService.processContent(
          analysisPrompt,
          section.variables,
        );

        section.content = processedContent;
      } catch (error: unknown) {
        console.error(`Error processing section ${section.key}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        section.content = `Error analyzing section: ${errorMessage}`;
      }
    }
  }

  private async formatNoteContent(
    note: GeneratedNote,
    level: ConciseLevel,
    promptConfig: PromptConfig,
  ): Promise<void> {
    note.metadata.conciseLevel = level;

    switch (level) {
      case 'bullet-points':
        await this.formatAsBulletPoints(note);
        break;
      case 'concise':
        await this.formatAsConcise(note, promptConfig);
        break;
      case 'detailed':
      default:
        // Detailed is the default format, no additional processing needed
        break;
    }
  }

  private async formatAsBulletPoints(note: GeneratedNote): Promise<void> {
    for (const section of note.sections) {
      if (!section.content) {
        continue;
      }

      const lines = section.content
        .split(/[.!?]+\s/)
        .filter(line => line.trim())
        .map(line => line.trim());

      const bulletPoints = lines.map((line) => {
        // Remove existing bullet points or numbering
        const cleanLine = line.replace(/^[-•*\d]+\.\s*/, '');
        return `• ${cleanLine}`;
      });

      section.content = bulletPoints.join('\n');
    }
  }

  private async formatAsConcise(
    note: GeneratedNote,
    promptConfig: PromptConfig,
  ): Promise<void> {
    for (const section of note.sections) {
      if (!section.content) {
        continue;
      }

      const concisePrompt = this.buildConcisePrompt(
        section.content,
        promptConfig,
      );

      try {
        const summarizedContent = await this.aiService.processContent(
          concisePrompt,
          section.variables,
        );
        section.content = summarizedContent;
      } catch (error: unknown) {
        console.error(`Error summarizing section ${section.key}:`, error);
        // Keep the original content if summarization fails
      }
    }
  }

  private buildBaseContext(config: PromptConfig): string {
    return `
      ${config.basePrompts.clinicalContext}
      ${config.basePrompts.medicalStandards}
      ${config.basePrompts.privacy}
    `.trim();
  }

  private buildAnalysisPrompt(
    section: GeneratedNote['sections'][0],
    level: AnalysisLevel,
    config: PromptConfig,
    baseContext: string,
  ): string {
    const depthGuide = {
      basic: 'Provide a basic overview focusing on key points.',
      detailed: 'Provide a detailed analysis including supporting information.',
      comprehensive: 'Provide an in-depth analysis with all relevant details and connections.',
    };

    return `
      ${baseContext}
      ${config.functionalPrompts.analysis}
      
      Section: ${section.title}
      Analysis Level: ${depthGuide[level]}
      
      ${config.templatePrompt}
      ${JSON.stringify(section.variables, null, 2)}
    `.trim();
  }

  private buildConcisePrompt(
    content: string,
    config: PromptConfig,
  ): string {
    return `
      ${config.basePrompts.clinicalContext}
      ${config.functionalPrompts.formatter}
      
      Please provide a concise summary of the following medical information,
      maintaining all critical details while reducing length by approximately 50%:
      
      ${content}
    `.trim();
  }

  private createError(
    type: NoteGenerationError,
    message: string,
  ): NoteGenerationResult {
    return {
      success: false,
      error: { type, message },
    };
  }
}
