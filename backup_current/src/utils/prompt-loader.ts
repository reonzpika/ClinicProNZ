import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { AnalysisLevelId } from '@/types/analysis-levels';

type PromptConfig = {
  basePrompts: string[];
  functionalPrompts: string[];
  templatePrompt?: string;
};

export async function loadPromptConfig(): Promise<PromptConfig> {
  const promptsDir = path.join(process.cwd(), 'src', 'prompts');

  // Load base prompts
  const basePrompts = await Promise.all([
    fs.readFile(path.join(promptsDir, 'base', 'clinical-context.md'), 'utf-8'),
    fs.readFile(path.join(promptsDir, 'base', 'medical-standards.md'), 'utf-8'),
  ]);

  // Load functional prompts
  const functionalPrompts = await Promise.all([
    fs.readFile(path.join(promptsDir, 'functional', 'input-processing.md'), 'utf-8'),
    fs.readFile(path.join(promptsDir, 'functional', 'analysis.md'), 'utf-8'),
    fs.readFile(path.join(promptsDir, 'functional', 'formatter.md'), 'utf-8'),
  ]);

  return {
    basePrompts,
    functionalPrompts,
  };
}

export async function loadTemplatePrompt(templateId: string): Promise<string> {
  const templatePath = path.join(
    process.cwd(),
    'src',
    'prompts',
    'templates',
    `${templateId}.md`,
  );

  try {
    return await fs.readFile(templatePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to load template: ${templateId}`);
  }
}

export function assemblePrompt(
  config: PromptConfig,
  templateId: string,
  analysisLevel: AnalysisLevelId,
): string {
  // Start with base context
  const prompt = [
    ...config.basePrompts,
    '', // Add spacing
    '# Template Configuration',
    config.templatePrompt,
    '', // Add spacing
    '# Analysis Configuration',
    // Replace the analysis level placeholder in the analysis prompt
    config.functionalPrompts[1].replace('{level}', analysisLevel),
    '', // Add spacing
    '# Processing Instructions',
    config.functionalPrompts[0], // Input processing
    '', // Add spacing
    '# Formatting Requirements',
    config.functionalPrompts[2], // Formatting
  ].join('\n\n');

  return validatePrompt(prompt) ? prompt : '';
}

export function validatePrompt(prompt: string): boolean {
  if (!prompt) {
    return false;
  }

  // Check for required sections
  const requiredSections = [
    '# Template Configuration',
    '# Analysis Configuration',
    '# Processing Instructions',
    '# Formatting Requirements',
  ];

  return requiredSections.every(section => prompt.includes(section));
}
