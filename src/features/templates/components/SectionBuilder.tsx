import { MoveDown, MoveUp, Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import type { TemplateSection, Template } from '../types';

function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now();
}

type SectionBuilderProps = {
  sections: TemplateSection[] | undefined;
  onChange: (sections: TemplateSection[]) => void;
  parentLabel?: string;
};

export function SectionBuilder({ sections = [], onChange, parentLabel }: SectionBuilderProps) {
  const addSection = () => {
    const newSection: TemplateSection = {
      id: generateId(),
      name: '',
      type: 'text',
      required: false,
      description: '',
      prompt: '',
      subsections: [],
    };
    onChange([...sections, newSection]);
  };

  const updateSection = (index: number, updates: Partial<TemplateSection>) => {
    const updatedSections = [...sections];
    updatedSections[index] = { ...updatedSections[index], ...updates };
    onChange(updatedSections);
  };

  const removeSection = (index: number) => {
    const updatedSections = sections.filter((_, i) => i !== index);
    onChange(updatedSections);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0)
      || (direction === 'down' && index === sections.length - 1)
    ) {
      return;
    }

    const updatedSections = [...sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updatedSections[index], updatedSections[newIndex]] = [
      updatedSections[newIndex],
      updatedSections[index],
    ];
    onChange(updatedSections);
  };

  const addSubsection = (sectionIdx: number) => {
    const updatedSections = [...sections];
    const newSub: TemplateSection = {
      id: generateId(),
      name: '',
      type: 'text',
      required: false,
      description: '',
      prompt: '',
      subsections: [],
    };
    if (!updatedSections[sectionIdx].subsections) updatedSections[sectionIdx].subsections = [];
    updatedSections[sectionIdx].subsections!.push(newSub);
    onChange(updatedSections);
  };

  const updateSubsections = (sectionIdx: number, newSubsections: TemplateSection[]) => {
    const updatedSections = [...sections];
    updatedSections[sectionIdx].subsections = newSubsections;
    onChange(updatedSections);
  };

  return (
    <div className="space-y-4">
      {parentLabel ? (
        <h4 className="text-sm font-medium">Subsections for {parentLabel}</h4>
      ) : (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Sections</h3>
          <Button onClick={addSection} size="sm">
            <Plus className="mr-2 size-4" />
            Add Section
          </Button>
        </div>
      )}
      <div className="space-y-4">
        {sections.map((section, index) => (
          <div key={section.id} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                {parentLabel ? 'Subsection' : 'Section'} {index + 1}
              </h4>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveSection(index, 'up')}
                  disabled={index === 0}
                >
                  <MoveUp className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveSection(index, 'down')}
                  disabled={index === sections.length - 1}
                >
                  <MoveDown className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSection(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Input
                value={section.name}
                onChange={e => updateSection(index, { name: e.target.value })}
                placeholder="Section name"
              />
              <select
                value={section.type}
                onChange={e => updateSection(index, { type: e.target.value as 'text' | 'array' })}
                className="border-[color:var(--input)] w-full rounded-md border bg-[color:var(--background)] px-3 py-2"
              >
                <option value="text">Text</option>
                <option value="array">Array</option>
              </select>
              <Input
                value={section.description}
                onChange={e => updateSection(index, { description: e.target.value })}
                placeholder="Section description"
              />
              <Textarea
                value={section.prompt}
                onChange={e => updateSection(index, { prompt: e.target.value })}
                placeholder="Section prompt"
                rows={4}
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={section.required}
                  onChange={e => updateSection(index, { required: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Required</span>
              </label>
            </div>
            {/* Subsections */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Subsections</span>
                <Button onClick={() => addSubsection(index)} size="xs" variant="outline">
                  <Plus className="mr-1 size-3" /> Add Subsection
                </Button>
              </div>
              {section.subsections && section.subsections.length > 0 && (
                <div className="ml-4 mt-2">
                  <SectionBuilder
                    sections={section.subsections}
                    onChange={newSubs => updateSubsections(index, newSubs)}
                    parentLabel={section.name}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
