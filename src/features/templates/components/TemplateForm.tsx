import { useEffect, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';

import type { SectionDSL, Template, TemplateDSL } from '../types';

type TemplateFormProps = {
  template: Template;
  onChange: (updates: Partial<Template>) => void;
};

export function TemplateForm({ template, onChange }: TemplateFormProps) {
  const [dsl, setDsl] = useState<TemplateDSL>(template.dsl || { sections: [] });

  // Reset state when template changes (e.g., when creating a new template)
  useEffect(() => {
    setDsl(template.dsl || { sections: [] });
  }, [template.id]);

  const updateDsl = (newDsl: TemplateDSL) => {
    setDsl(newDsl);
    onChange({ dsl: newDsl });
  };

  const addSection = () => {
    const newSection: SectionDSL = {
      heading: '',
      prompt: '',
    };
    updateDsl({
      ...dsl,
      sections: [...dsl.sections, newSection],
    });
  };

  const updateSection = (index: number, updates: Partial<SectionDSL>) => {
    const newSections = [...dsl.sections];
    const currentSection = newSections[index];
    if (currentSection) {
      newSections[index] = { ...currentSection, ...updates };
      updateDsl({
        ...dsl,
        sections: newSections,
      });
    }
  };

  const removeSection = (index: number) => {
    const newSections = dsl.sections.filter((_, i) => i !== index);
    updateDsl({
      ...dsl,
      sections: newSections,
    });
  };

  const addSubsection = (sectionIndex: number) => {
    const newSubsection: SectionDSL = {
      heading: '',
      prompt: '',
    };
    const newSections = [...dsl.sections];
    const currentSection = newSections[sectionIndex];
    if (currentSection) {
      if (!currentSection.subsections) {
        currentSection.subsections = [];
      }
      currentSection.subsections.push(newSubsection);
      updateDsl({
        ...dsl,
        sections: newSections,
      });
    }
  };

  const updateSubsection = (sectionIndex: number, subsectionIndex: number, updates: Partial<SectionDSL>) => {
    const newSections = [...dsl.sections];
    const currentSection = newSections[sectionIndex];
    if (currentSection?.subsections?.[subsectionIndex]) {
      const currentSubsection = currentSection.subsections[subsectionIndex];
      currentSection.subsections[subsectionIndex] = { ...currentSubsection, ...updates };
      updateDsl({
        ...dsl,
        sections: newSections,
      });
    }
  };

  const removeSubsection = (sectionIndex: number, subsectionIndex: number) => {
    const newSections = [...dsl.sections];
    const currentSection = newSections[sectionIndex];
    if (currentSection?.subsections) {
      currentSection.subsections = currentSection.subsections.filter(
        (_, i) => i !== subsectionIndex,
      );
      updateDsl({
        ...dsl,
        sections: newSections,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Template Info */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={template.name || ''}
            onChange={e => onChange({ name: e.target.value })}
            placeholder="Enter template name"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={template.description || ''}
            onChange={e => onChange({ description: e.target.value })}
            placeholder="Enter template description"
            rows={3}
          />
        </div>
      </div>

      {/* Overall Instructions */}
      <div>
        <Label htmlFor="overallInstructions">Overall Instructions (Optional)</Label>
        <Textarea
          id="overallInstructions"
          value={dsl.overallInstructions || ''}
          onChange={e => updateDsl({ ...dsl, overallInstructions: e.target.value })}
          placeholder="Enter overall instructions for the template"
          rows={3}
        />
      </div>

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Template Sections</Label>
          <Button type="button" onClick={addSection} size="sm">
            Add Section
          </Button>
        </div>

        {dsl.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                Section
                {' '}
                {sectionIndex + 1}
              </h4>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeSection(sectionIndex)}
              >
                Remove
              </Button>
            </div>

            <div>
              <Label htmlFor={`section-heading-${sectionIndex}`}>Section Heading</Label>
              <Input
                id={`section-heading-${sectionIndex}`}
                value={section.heading}
                onChange={e => updateSection(sectionIndex, { heading: e.target.value })}
                placeholder="Enter section heading"
              />
            </div>

            <div>
              <Label htmlFor={`section-prompt-${sectionIndex}`}>Section Prompt</Label>
              <Textarea
                id={`section-prompt-${sectionIndex}`}
                value={section.prompt}
                onChange={e => updateSection(sectionIndex, { prompt: e.target.value })}
                placeholder="Enter prompt for this section"
                rows={3}
              />
            </div>

            {/* Subsections */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Subsections</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addSubsection(sectionIndex)}
                >
                  Add Subsection
                </Button>
              </div>

              {section.subsections?.map((subsection, subsectionIndex) => (
                <div key={subsectionIndex} className="ml-4 space-y-2 rounded border p-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium">
                      Subsection
                      {' '}
                      {subsectionIndex + 1}
                    </h5>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeSubsection(sectionIndex, subsectionIndex)}
                    >
                      Remove
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor={`subsection-heading-${sectionIndex}-${subsectionIndex}`} className="text-sm">
                      Subsection Heading
                    </Label>
                    <Input
                      id={`subsection-heading-${sectionIndex}-${subsectionIndex}`}
                      value={subsection.heading}
                      onChange={e => updateSubsection(sectionIndex, subsectionIndex, { heading: e.target.value })}
                      placeholder="Enter subsection heading"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`subsection-prompt-${sectionIndex}-${subsectionIndex}`} className="text-sm">
                      Subsection Prompt
                    </Label>
                    <Textarea
                      id={`subsection-prompt-${sectionIndex}-${subsectionIndex}`}
                      value={subsection.prompt}
                      onChange={e => updateSubsection(sectionIndex, subsectionIndex, { prompt: e.target.value })}
                      placeholder="Enter prompt for this subsection"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {dsl.sections.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              No sections yet. Click "Add Section" to start building your template.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
