import { Section } from '@/shared/components/layout/Section';
import { Stack } from '@/shared/components/layout/Stack';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';

import type { Template } from '../types';

type TemplateFormProps = {
  template: Template;
  onChange: (updates: Partial<Template>) => void;
};

export function TemplateForm({ template, onChange }: TemplateFormProps) {
  return (
    <div>
      <Stack spacing="md">
        <Section title="Template Details">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                value={template.name}
                onChange={e => onChange({ name: e.target.value })}
                placeholder="Enter template name"
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={template.description || ''}
                onChange={e => onChange({ description: e.target.value })}
                placeholder="Enter template description"
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="structure" className="block text-sm font-medium">
                Structure Prompt
              </label>
              <Textarea
                id="structure"
                value={template.prompts?.structure || ''}
                onChange={e => onChange({ prompts: { ...template.prompts, structure: e.target.value } })}
                placeholder="Enter structure prompt"
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="example" className="block text-sm font-medium">
                Example Output (optional)
              </label>
              <Textarea
                id="example"
                value={template.prompts?.example || ''}
                onChange={e => onChange({ prompts: { ...template.prompts, example: e.target.value } })}
                placeholder="Enter example output (multi-line allowed)"
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
        </Section>
      </Stack>
    </div>
  );
}
