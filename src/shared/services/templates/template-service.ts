import { getUserId } from '../auth/clerk';

// Template types
export type Template = {
  id: string;
  name: string;
  type: 'default' | 'custom';
  ownerId?: string;
  sessionId: string;
  sections: {
    name: string;
    type: 'text' | 'array';
    required: boolean;
    description: string;
    prompt: string;
    subsections?: any[];
  }[];
  prompts: {
    system: string;
    structure: string;
  };
};

// Template service
export class TemplateService {
  private static instance: TemplateService;
  private templates: Map<string, Template> = new Map();

  private constructor() {
    this.loadDefaultTemplates();
  }

  public static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  private loadDefaultTemplates() {
    // Load default templates
    const defaultTemplates: Template[] = [
      {
        id: 'default-soap',
        name: 'SOAP Note',
        type: 'default',
        sessionId: 'default',
        sections: [
          {
            name: 'subjective',
            type: 'text',
            required: true,
            description: 'Patient\'s description of symptoms and history',
            prompt: 'Summarize the patient\'s main concerns and history in 1-2 concise paragraphs.'
          },
          {
            name: 'objective',
            type: 'array',
            required: true,
            description: 'Clinical findings and examination results',
            prompt: 'List all clinical findings, vital signs, and examination results as bullet points.'
          },
          {
            name: 'assessment',
            type: 'text',
            required: true,
            description: 'Clinical diagnosis or impression',
            prompt: 'Provide a clear clinical assessment or diagnosis.'
          },
          {
            name: 'plan',
            type: 'array',
            required: true,
            description: 'Treatment plan and follow-up',
            prompt: 'List all treatment actions, medications, and follow-up plans as bullet points.'
          }
        ],
        prompts: {
          system: 'You are a medical documentation assistant for New Zealand GPs. Follow NZ medical documentation standards.',
          structure: 'Generate a medical note following the SOAP format. Include all relevant clinical information.'
        }
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  public async getTemplate(id: string): Promise<Template | null> {
    return this.templates.get(id) || null;
  }

  public async listTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  public async persistTemplateSelection(templateId: string): Promise<void> {
    try {
      const userId = await getUserId();
      if (userId) {
        // In a real implementation, this would save to a database
        localStorage.setItem(`user_${userId}_lastTemplate`, templateId);
      }
    } catch (error) {
      console.error('Failed to persist template selection:', error);
    }
  }

  public async getLastUsedTemplate(): Promise<string | null> {
    try {
      const userId = await getUserId();
      if (userId) {
        return localStorage.getItem(`user_${userId}_lastTemplate`);
      }
      return null;
    } catch (error) {
      console.error('Failed to get last used template:', error);
      return null;
    }
  }
}

// Export singleton instance
export const templateService = TemplateService.getInstance(); 