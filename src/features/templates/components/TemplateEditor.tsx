import { Template } from '@/shared/types/templates';
import { TemplateForm } from './TemplateForm';
import { SectionBuilder } from './SectionBuilder';
import { Button } from '@/shared/components/ui/button';

interface TemplateEditorProps {
  template: Template;
  onSave: (template: Template) => void;
  onCancel: () => void;
}

export function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const handleChange = (updates: Partial<Template>) => {
    onSave({ ...template, ...updates });
  };

  return (
    <div className="space-y-8">
      <TemplateForm template={template} onChange={handleChange} />
      <SectionBuilder template={template} onChange={handleChange} />
      
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(template)}>
          Save Template
        </Button>
      </div>
    </div>
  );
} 