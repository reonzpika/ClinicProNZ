import { Template } from '@/shared/types/templates';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';

interface TemplateFormProps {
  template: Template;
  onChange: (updates: Partial<Template>) => void;
}

export function TemplateForm({ template, onChange }: TemplateFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Template Name</Label>
        <Input
          id="name"
          value={template.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Enter template name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Template Type</Label>
        <select
          id="type"
          value={template.type}
          onChange={(e) => onChange({ type: e.target.value as 'default' | 'custom' })}
          className="w-full rounded-md border border-input bg-background px-3 py-2"
        >
          <option value="default">Default</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={template.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Enter template description"
        />
      </div>
    </div>
  );
} 