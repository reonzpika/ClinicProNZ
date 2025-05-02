import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Section } from '@/shared/components/layout/Section';
import { Stack } from '@/shared/components/layout/Stack';
import { Alert } from '@/shared/components/ui/alert';

import type { Template } from '../types';

type TemplateFormProps = {
  template?: Template;
  onSubmit: (template: Omit<Template, 'id'>) => void;
  onCancel: () => void;
};

export function TemplateForm({ template, onSubmit, onCancel }: TemplateFormProps) {
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [structure, setStructure] = useState(template?.prompts?.structure || '');
  const [example, setExample] = useState(template?.prompts?.example || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Template name is required');
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      sections: template?.sections || [],
      prompts: {
        ...template?.prompts,
        structure: structure,
        example: example || undefined,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing="md">
        <Section title="Template Details">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                value={structure}
                onChange={(e) => setStructure(e.target.value)}
                placeholder="Enter structure prompt (multi-line allowed)"
                className="mt-1"
                rows={4}
              />
            </div>

            <div>
              <label htmlFor="example" className="block text-sm font-medium">
                Example Output (optional)
              </label>
              <Textarea
                id="example"
                value={example}
                onChange={(e) => setExample(e.target.value)}
                placeholder="Enter example output (multi-line allowed)"
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
        </Section>

        {error && (
          <Alert variant="destructive">
            {error}
          </Alert>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {template ? 'Update' : 'Create'} Template
          </Button>
        </div>
      </Stack>
    </form>
  );
}
