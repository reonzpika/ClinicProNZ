import type { Template, TemplateSection } from '../types';

function formatSection(section: TemplateSection): string {
  let result = `${section.name}:
${section.prompt}`;
  if (section.subsections && section.subsections.length > 0) {
    result += '\nSubsections:';
    result += '\n' + section.subsections
      .map(sub => `- ${sub.name}: ${sub.prompt}`)
      .join('\n');
  }
  return result;
}

/**
 * Converts a Template to the minimal prompt string for the AI (MVP spec).
 * Structure prompt is placed at the top, followed by section prompts, then example output.
 * Now includes a defensive check for missing prompts/structure.
 */
export function buildTemplatePrompt(template: Template): string {
  if (!template.prompts || !template.prompts.structure) {
    return 'This template is missing its structure prompt.';
  }
  let result = '';
  result += template.prompts.structure + '\n\n';
  result += (template.sections || [])
    .map(formatSection)
    .join('\n\n');
  if (template.prompts.example) {
    result += `\n\nExample output:\n${template.prompts.example}`;
  }
  return result;
} 