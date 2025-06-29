/* eslint-disable no-alert */
'use client';

import { Lightbulb, Save, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';

import type { Template } from '../types';
import { validateTemplate } from '../utils/validation';

type TemplateEditorProps = {
  template: Template;
  onSave: (template: Template) => void;
  onCancel: () => void;
};

// Helper function to analyze template content
function analyzeTemplate(templateBody: string) {
  const placeholders = templateBody.match(/\[([^\]]+)\]/g) || [];
  const conditionals = templateBody.match(/\([^)]*only include[^)]*\)/gi) || [];
  const sections = templateBody.split('\n').filter(line =>
    line.trim() && !line.startsWith('-') && !line.startsWith('(') && !line.includes('['),
  ).length;

  return {
    placeholderCount: placeholders.length,
    conditionalCount: conditionals.length,
    sectionCount: sections,
    placeholders: placeholders.map(p => p.replace(/[[\]]/g, '')),
  };
}

export function TemplateEditor({ template: initialTemplate, onSave, onCancel }: TemplateEditorProps) {
  const [template, setTemplate] = useState<Template>(initialTemplate);
  const [isSaving, setIsSaving] = useState(false);

  const handleFieldChange = (field: keyof Template, value: any) => {
    setTemplate(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const validation = validateTemplate(template);
    if (!validation.isValid) {
      alert(`Template validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(template);
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const validation = validateTemplate(template);
  const analysis = useMemo(() => analyzeTemplate(template.templateBody), [template.templateBody]);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Main Content */}
      <div className="flex min-h-0 flex-1">
        {/* Editor Panel (70%) */}
        <div className="flex flex-1 flex-col border-r border-slate-200">
          {/* Template Details Header */}
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-medium text-slate-900">Template Details</h3>
                <div className="flex gap-2">
                  <Badge
                    variant={analysis.placeholderCount > 0 ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {analysis.placeholderCount}
                    {' '}
                    placeholder
                    {analysis.placeholderCount !== 1 ? 's' : ''}
                  </Badge>
                  <Badge
                    variant={analysis.conditionalCount > 0 ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {analysis.conditionalCount}
                    {' '}
                    instruction
                    {analysis.conditionalCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSave}
                  disabled={!validation.isValid || isSaving}
                  className="h-9 bg-slate-600 hover:bg-slate-700"
                >
                  <Save className="mr-2 size-4" />
                  {isSaving ? 'Saving...' : 'Save Template'}
                </Button>
                <Button variant="outline" onClick={onCancel} className="h-9">
                  <X className="mr-2 size-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>

          {/* Compact Header Info */}
          <div className="space-y-3 border-b border-slate-200 bg-white p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-xs font-medium text-slate-700">
                  Template Name
                </Label>
                <Input
                  id="name"
                  value={template.name}
                  onChange={e => handleFieldChange('name', e.target.value)}
                  placeholder="Enter template name"
                  className={`h-8 text-sm ${!template.name.trim() ? 'border-red-300 focus:border-red-500' : 'border-slate-300'}`}
                />
                {!template.name.trim() && (
                  <p className="mt-1 text-xs text-red-600">Required</p>
                )}
              </div>
              <div>
                <Label htmlFor="description" className="text-xs font-medium text-slate-700">
                  Description (optional)
                </Label>
                <Input
                  id="description"
                  value={template.description || ''}
                  onChange={e => handleFieldChange('description', e.target.value)}
                  placeholder="Brief description"
                  className="h-8 border-slate-300 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="templateBody" className="text-sm font-medium text-slate-700">
                Template Content
              </Label>
              <span className="text-xs text-slate-500">
                {template.templateBody.length.toLocaleString()}
                {' '}
                characters
              </span>
            </div>
          </div>

          {/* Main Textarea - Takes All Available Space */}
          <div className="min-h-0 flex-1 p-4">
            <Textarea
              id="templateBody"
              value={template.templateBody}
              onChange={e => handleFieldChange('templateBody', e.target.value)}
              placeholder={`Write your template using natural language with placeholders...

Example structure:
(Instructions explaining the purpose and rules for this template)

SUBJECTIVE:
- Chief complaint: [Patient's main concern] (only include if explicitly mentioned)
- History of present illness: [Detailed description] (only include if mentioned)
- Past medical history: [Relevant conditions] (only include if mentioned)

OBJECTIVE:
- Vital signs: [Temperature, BP, HR, RR] (only include if measured)
- Physical examination: [Examination findings] (only include if performed)

ASSESSMENT:
- Clinical impression: [Diagnosis or working diagnosis] (only include if determined)

PLAN:
- Treatment plan: [Medications, procedures, follow-up] (only include if discussed)

(Always omit sections where information was not provided or discussed)`}
              className="size-full resize-none border-slate-300 bg-slate-50 font-mono text-sm focus:bg-white"
            />
          </div>
        </div>

        {/* Help Panel (30%) */}
        <div className="flex h-full w-80 flex-col border-l border-blue-200 bg-blue-50">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-4 flex items-center gap-2">
              <Lightbulb className="size-5 text-blue-600" />
              <h3 className="text-lg font-medium text-blue-900">Writing Guide</h3>
            </div>

            <div className="space-y-6 text-sm">
              {/* Placeholders Section */}
              <div>
                <h4 className="mb-2 font-medium text-blue-900">Placeholders</h4>
                <div className="space-y-2 text-blue-800">
                  <p>Use square brackets for dynamic content:</p>
                  <code className="block rounded bg-blue-100 p-2 font-mono text-xs">
                    [Patient's chief complaint]
                  </code>
                </div>
              </div>

              {/* Anti-hallucination Section */}
              <div>
                <h4 className="mb-2 font-medium text-blue-900">Prevent Hallucination</h4>
                <div className="space-y-2 text-blue-800">
                  <p>Add instructions to only include mentioned information:</p>
                  <code className="block rounded bg-blue-100 p-2 font-mono text-xs">
                    [Information] (only include if explicitly mentioned)
                  </code>
                </div>
              </div>

              {/* Template Structure */}
              <div>
                <h4 className="mb-2 font-medium text-blue-900">Structure Tips</h4>
                <ul className="space-y-1 text-xs text-blue-800">
                  <li>• Start with template instructions in parentheses</li>
                  <li>• Use clear section headings</li>
                  <li>• Group related information together</li>
                  <li>• End with handling missing information</li>
                </ul>
              </div>

              {/* Example */}
              <div>
                <h4 className="mb-2 font-medium text-blue-900">Quick Example</h4>
                <code className="block rounded bg-blue-100 p-2 font-mono text-xs leading-relaxed">
                  CONSULTATION NOTES:
                  <br />
                  - Chief complaint: [Main concern] (only include if mentioned)
                  <br />
                  - Assessment: [Clinical findings] (only include if discussed)
                </code>
              </div>

              {/* Validation Status */}
              {!validation.isValid && (
                <div className="rounded border border-red-200 bg-red-50 p-3">
                  <h4 className="mb-1 font-medium text-red-900">Issues Found</h4>
                  <ul className="space-y-1 text-xs text-red-800">
                    {validation.errors.map((error, index) => (
                      <li key={index}>
                        •
                        {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
