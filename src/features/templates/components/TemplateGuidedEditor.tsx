'use client';

import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';

import type { Template } from '../types';
import { validateTemplate } from '../utils/validation';

type TemplateSection = {
  id: string;
  name: string;
  placeholders: string[];
  instructions: string;
};

type GuidedEditorStep = 'basics' | 'structure' | 'placeholders' | 'instructions' | 'review';

type TemplateGuidedEditorProps = {
  template: Template;
  onSave: (template: Template) => void;
  onCancel: () => void;
};

const COMMON_SECTIONS = [
  { name: 'CONSULTATION DETAILS', placeholders: ['Date and type', 'Reason for visit'] },
  { name: 'HISTORY', placeholders: ['Presenting complaint', 'Past medical history', 'Current medications'] },
  { name: 'EXAMINATION', placeholders: ['Vital signs', 'Physical examination findings'] },
  { name: 'ASSESSMENT', placeholders: ['Clinical impression', 'Differential diagnosis'] },
  { name: 'PLAN', placeholders: ['Treatment plan', 'Follow-up arrangements'] },
];

export function TemplateGuidedEditor({ template: initialTemplate, onSave, onCancel }: TemplateGuidedEditorProps) {
  const [currentStep, setCurrentStep] = useState<GuidedEditorStep>('basics');
  const [template, setTemplate] = useState<Template>(initialTemplate);
  const [sections, setSections] = useState<TemplateSection[]>([]);
  const [preamble, setPreamble] = useState('');
  const [conclusion, setConclusion] = useState('');

  const steps: { id: GuidedEditorStep; title: string; description: string }[] = [
    { id: 'basics', title: 'Basic Info', description: 'Name and description' },
    { id: 'structure', title: 'Structure', description: 'Define sections' },
    { id: 'placeholders', title: 'Placeholders', description: 'Add content fields' },
    { id: 'instructions', title: 'Instructions', description: 'Add guidance' },
    { id: 'review', title: 'Review', description: 'Final review' },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]!.id);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]!.id);
    }
  };

  const addSection = (sectionName?: string) => {
    const newSection: TemplateSection = {
      id: `section-${Date.now()}`,
      name: sectionName || '',
      placeholders: [],
      instructions: '',
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (id: string, updates: Partial<TemplateSection>) => {
    setSections(sections.map(section =>
      section.id === id ? { ...section, ...updates } : section,
    ));
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id));
  };

  const addPlaceholder = (sectionId: string, placeholder?: string) => {
    updateSection(sectionId, {
      placeholders: [...sections.find(s => s.id === sectionId)?.placeholders || [], placeholder || ''],
    });
  };

  const updatePlaceholder = (sectionId: string, index: number, value: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      const newPlaceholders = [...section.placeholders];
      newPlaceholders[index] = value;
      updateSection(sectionId, { placeholders: newPlaceholders });
    }
  };

  const removePlaceholder = (sectionId: string, index: number) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      const newPlaceholders = section.placeholders.filter((_, i) => i !== index);
      updateSection(sectionId, { placeholders: newPlaceholders });
    }
  };

  const generateTemplateBody = () => {
    const parts: string[] = [];

    // Add preamble
    if (preamble.trim()) {
      parts.push(`(${preamble.trim()})`);
      parts.push('');
    }

    // Add sections
    sections.forEach((section) => {
      if (section.name.trim()) {
        parts.push(`${section.name.toUpperCase()}:`);
        section.placeholders.forEach((placeholder) => {
          if (placeholder.trim()) {
            parts.push(`- [${placeholder}] (only include if explicitly mentioned)`);
          }
        });
        parts.push('');
      }
    });

    // Add conclusion
    if (conclusion.trim()) {
      parts.push(`(${conclusion.trim()})`);
    }

    return parts.join('\n');
  };

  const handleFinish = () => {
    const generatedBody = generateTemplateBody();
    const updatedTemplate = {
      ...template,
      templateBody: generatedBody,
    };
    onSave(updatedTemplate);
  };

  const validation = validateTemplate(template);

  const renderBasicsStep = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Template Name</Label>
        <Input
          id="name"
          value={template.name}
          onChange={e => setTemplate(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., GP Consultation Note"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={template.description || ''}
          onChange={e => setTemplate(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe when to use this template"
          rows={3}
        />
      </div>
    </div>
  );

  const renderStructureStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Template Sections</h3>
        <Button onClick={() => addSection()} size="sm">
          <Plus className="mr-1 size-4" />
          Add Section
        </Button>
      </div>

      {/* Quick Add Common Sections */}
      <div>
        <Label>Quick Add Common Sections</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {COMMON_SECTIONS.map(commonSection => (
            <Button
              key={commonSection.name}
              variant="outline"
              size="sm"
              onClick={() => addSection(commonSection.name)}
            >
              {commonSection.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Current Sections */}
      <div className="space-y-2">
        {sections.map(section => (
          <div key={section.id} className="flex items-center gap-2 rounded border p-2">
            <Input
              value={section.name}
              onChange={e => updateSection(section.id, { name: e.target.value })}
              placeholder="Section name"
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeSection(section.id)}
            >
              <Minus className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPlaceholdersStep = () => (
    <div className="space-y-4">
      {sections.map(section => (
        <Card key={section.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{section.name || 'Unnamed Section'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {section.placeholders.map((placeholder, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={placeholder}
                  onChange={e => updatePlaceholder(section.id, index, e.target.value)}
                  placeholder="Placeholder description"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePlaceholder(section.id, index)}
                >
                  <Minus className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addPlaceholder(section.id)}
              className="w-full"
            >
              <Plus className="mr-1 size-4" />
              Add Placeholder
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderInstructionsStep = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="preamble">Template Preamble</Label>
        <Textarea
          id="preamble"
          value={preamble}
          onChange={e => setPreamble(e.target.value)}
          placeholder="Instructions for the AI about how to use this template..."
          rows={3}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          This appears at the beginning and guides the AI's behavior
        </p>
      </div>
      <div>
        <Label htmlFor="conclusion">Template Conclusion</Label>
        <Textarea
          id="conclusion"
          value={conclusion}
          onChange={e => setConclusion(e.target.value)}
          placeholder="Final instructions about handling missing information..."
          rows={3}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          This appears at the end with final guidance
        </p>
      </div>
    </div>
  );

  const renderReviewStep = () => {
    const generatedBody = generateTemplateBody();
    return (
      <div className="space-y-4">
        <div>
          <Label>Generated Template</Label>
          <div className="mt-2 rounded border bg-muted p-3">
            <pre className="whitespace-pre-wrap text-sm">{generatedBody}</pre>
          </div>
        </div>

        {!validation.isValid && (
          <div className="space-y-1">
            {validation.errors.map((error, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="size-4" />
                {error.message}
              </div>
            ))}
          </div>
        )}

        {validation.isValid && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="size-4" />
            Template is ready to save
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Guided Template Creator</h2>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center gap-2 rounded px-3 py-1 ${
                index <= currentStepIndex ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
              >
                <span className="text-sm font-medium">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="mx-1 size-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStepIndex]!.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {steps[currentStepIndex]!.description}
            </p>
          </CardHeader>
          <CardContent>
            {currentStep === 'basics' && renderBasicsStep()}
            {currentStep === 'structure' && renderStructureStep()}
            {currentStep === 'placeholders' && renderPlaceholdersStep()}
            {currentStep === 'instructions' && renderInstructionsStep()}
            {currentStep === 'review' && renderReviewStep()}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t p-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
        >
          <ChevronLeft className="mr-1 size-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            Step
            {' '}
            {currentStepIndex + 1}
            {' '}
            of
            {' '}
            {steps.length}
          </Badge>
        </div>

        {currentStepIndex === steps.length - 1
          ? (
              <Button
                onClick={handleFinish}
                disabled={!validation.isValid}
              >
                Save Template
              </Button>
            )
          : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="ml-1 size-4" />
              </Button>
            )}
      </div>
    </div>
  );
}
