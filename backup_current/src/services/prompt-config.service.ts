import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { promptConfigSchema } from '@/models/Schema';
import type { PromptConfig } from '@/types/note-generation';

export class PromptConfigService {
  private static instance: PromptConfigService;
  private cachedConfig: PromptConfig | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): PromptConfigService {
    if (!PromptConfigService.instance) {
      PromptConfigService.instance = new PromptConfigService();
    }
    return PromptConfigService.instance;
  }

  async getConfig(): Promise<PromptConfig> {
    if (this.isCacheValid()) {
      return this.cachedConfig!;
    }

    try {
      const config = await this.loadFromDatabase();
      this.updateCache(config);
      return config;
    } catch (error) {
      console.error('Error loading prompt config:', error);
      return this.getFallbackConfig();
    }
  }

  private isCacheValid(): boolean {
    return (
      this.cachedConfig !== null
      && Date.now() - this.lastFetch < this.CACHE_TTL
    );
  }

  private updateCache(config: PromptConfig): void {
    this.cachedConfig = config;
    this.lastFetch = Date.now();
  }

  private async loadFromDatabase(): Promise<PromptConfig> {
    try {
      const result = await db
        .select()
        .from(promptConfigSchema)
        .where(eq(promptConfigSchema.isActive, true))
        .limit(1);

      if (result.length === 0) {
        throw new Error('No active prompt configuration found');
      }

      const dbConfig = result[0];
      return {
        basePrompts: dbConfig.basePrompts,
        functionalPrompts: dbConfig.functionalPrompts,
        templatePrompt: dbConfig.templatePrompt,
      };
    } catch (error) {
      console.error('Database error loading prompt config:', error);
      throw error;
    }
  }

  private getFallbackConfig(): PromptConfig {
    return {
      basePrompts: {
        clinicalContext: 'You are a medical professional analyzing clinical data. Follow evidence-based practices and maintain professional documentation standards.',
        medicalStandards: 'Adhere to current medical documentation guidelines, including proper medical terminology and standard abbreviations.',
        privacy: 'Ensure strict compliance with HIPAA privacy regulations. Avoid including any personally identifiable information unless specifically required.',
      },
      functionalPrompts: {
        inputProcessor: 'Process the following clinical information, focusing on relevant medical findings and significant details:',
        analysis: 'Analyze the following medical data, considering both immediate findings and potential implications:',
        formatter: 'Format the following medical note according to professional documentation standards:',
      },
      templatePrompt: 'Structure the response according to the following template, maintaining consistency with established medical documentation practices:',
    };
  }
}
