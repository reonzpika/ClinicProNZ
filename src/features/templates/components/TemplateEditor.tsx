import { useState } from 'react';

import type { Template } from '@/features/templates/types';
import { Button } from '@/shared/components/ui/button';

import { SectionBuilder } from './SectionBuilder';
import { TemplateForm } from './TemplateForm';

type TemplateEditorProps = {
  template: Template;
  onSave: (template: Template) => void;
  onCancel: () => void;
};

export function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const [currentTemplate, setCurrentTemplate] = useState<Template>(template);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (updates: Partial<Template>) => {
    setCurrentTemplate(prev => ({ ...prev, ...updates }));
    setError(null);
  };

  const isValid = !!currentTemplate.name?.trim() && !!currentTemplate.prompts?.structure?.trim();

  const handleSave = () => {
    if (!isValid) {
      setError('Name and Structure Prompt are required.');
      return;
    }
    // Remove date fields before saving
    const { createdAt, updatedAt, ...templateToSave } = currentTemplate;
    onSave(templateToSave);
  };

  return (
    <div className="space-y-8">
      <TemplateForm template={currentTemplate} onChange={handleChange} />
      <SectionBuilder sections={currentTemplate.sections} onChange={sections => handleChange({ sections })} />

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
