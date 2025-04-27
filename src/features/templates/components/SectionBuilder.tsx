import { Template, Section } from '@/shared/types/templates';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Plus, Trash2, MoveUp, MoveDown } from 'lucide-react';

interface SectionBuilderProps {
  template: Template;
  onChange: (updates: Partial<Template>) => void;
}

export function SectionBuilder({ template, onChange }: SectionBuilderProps) {
  const addSection = () => {
    const newSection: Section = {
      name: '',
      type: 'text',
      required: false,
      description: '',
      prompt: '',
    };
    onChange({ sections: [...template.sections, newSection] });
  };

  const updateSection = (index: number, updates: Partial<Section>) => {
    const updatedSections = [...template.sections];
    updatedSections[index] = { ...updatedSections[index], ...updates };
    onChange({ sections: updatedSections });
  };

  const removeSection = (index: number) => {
    const updatedSections = template.sections.filter((_, i) => i !== index);
    onChange({ sections: updatedSections });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === template.sections.length - 1)
    ) {
      return;
    }

    const updatedSections = [...template.sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updatedSections[index], updatedSections[newIndex]] = [
      updatedSections[newIndex],
      updatedSections[index],
    ];
    onChange({ sections: updatedSections });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Sections</h3>
        <Button onClick={addSection} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      <div className="space-y-4">
        {template.sections.map((section, index) => (
          <div key={section.name} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Section {index + 1}</h4>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveSection(index, 'up')}
                  disabled={index === 0}
                >
                  <MoveUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveSection(index, 'down')}
                  disabled={index === template.sections.length - 1}
                >
                  <MoveDown className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSection(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Input
                value={section.name}
                onChange={(e) =>
                  updateSection(index, { name: e.target.value })
                }
                placeholder="Section name"
              />
              <select
                value={section.type}
                onChange={(e) =>
                  updateSection(index, { type: e.target.value as 'text' | 'array' })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="text">Text</option>
                <option value="array">Array</option>
              </select>
              <Input
                value={section.description}
                onChange={(e) =>
                  updateSection(index, { description: e.target.value })
                }
                placeholder="Section description"
              />
              <Textarea
                value={section.prompt}
                onChange={(e) =>
                  updateSection(index, { prompt: e.target.value })
                }
                placeholder="Section prompt"
                rows={4}
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={section.required}
                  onChange={(e) =>
                    updateSection(index, { required: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Required</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 