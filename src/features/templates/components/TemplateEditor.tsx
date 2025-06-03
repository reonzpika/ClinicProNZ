import { useEffect, useState } from 'react';

import type { Template } from '@/features/templates/types';
import { Button } from '@/shared/components/ui/button';

import { TemplateForm } from './TemplateForm';

type TemplateEditorProps = {
  template: Template;
  onSave: (template: Template) => void;
  onCancel: () => void;
};

export function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const [currentTemplate, setCurrentTemplate] = useState<Template>(template);
  const [error, setError] = useState<string | null>(null);

  // Sync currentTemplate when template prop changes
  useEffect(() => {
    setCurrentTemplate(template);
  }, [template]);

  const handleChange = (updates: Partial<Template>) => {
    setCurrentTemplate(prev => ({ ...prev, ...updates }));
    setError(null);
  };

  const isValid = !!currentTemplate.name?.trim()
    && !!currentTemplate.dsl?.sections?.length
    && currentTemplate.dsl.sections.every(section =>
      !!section.heading?.trim() && !!section.prompt?.trim(),
    );

  const handleSave = () => {
    if (!isValid) {
      setError('Name and at least one section with heading and prompt are required.');
      return;
    }
    // Remove date fields before saving
    const { createdAt, updatedAt, ...templateToSave } = currentTemplate;
    onSave(templateToSave);
  };

  // Determine if this is a new template (no ID means it's new)
  const isNewTemplate = !template.id || template.id === '';

  return (
    <div className="space-y-8">
      <TemplateForm
        template={currentTemplate}
        onChange={handleChange}
      />

      {error && <div className="text-red-500">{error}</div>}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!isValid}>
          Save Template
        </Button>
      </div>
    </div>
  );
}
