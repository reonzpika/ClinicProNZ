/* eslint-disable no-alert */
'use client';

import { Lightbulb } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
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
    <div className="flex h-full flex-col">
      {/* Header with controls */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Template Editor</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={!validation.isValid || isSaving}>
            {isSaving ? 'Saving...' : 'Save Template'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 p-4">
        {/* Editor Panel */}
        <Card className="flex w-[70%] flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Template Details</CardTitle>
              {/* Template Analysis */}
              <div className="flex gap-1">
                <Badge variant={analysis.placeholderCount > 0 ? 'default' : 'secondary'}>
                  {analysis.placeholderCount}
                  {' '}
                  placeholders
                </Badge>
                <Badge variant={analysis.conditionalCount > 0 ? 'default' : 'secondary'}>
                  {analysis.conditionalCount}
                  {' '}
                  instructions
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-2">
            <div>
              <Label htmlFor="name" className="text-sm">Template Name</Label>
              <Input
                id="name"
                value={template.name}
                onChange={e => handleFieldChange('name', e.target.value)}
                placeholder="Enter template name"
                className={`h-8 ${!template.name.trim() ? 'border-red-200' : ''}`}
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm">Description</Label>
              <Textarea
                id="description"
                value={template.description || ''}
                onChange={e => handleFieldChange('description', e.target.value)}
                placeholder="Describe what this template is used for"
                rows={1}
                className="min-h-[32px] resize-none"
              />
            </div>

            <div className="flex flex-1 flex-col">
              <div className="mb-1 flex items-center justify-between">
                <Label htmlFor="templateBody" className="text-sm">Template Body</Label>
                <div className="text-xs text-muted-foreground">
                  {template.templateBody.length}
                  {' '}
                  characters
                </div>
              </div>
              <Textarea
                id="templateBody"
                value={template.templateBody}
                onChange={e => handleFieldChange('templateBody', e.target.value)}
                placeholder={`Enter your template using natural language with placeholders...

Example structure:
(Template instructions explaining purpose and rules)

SECTION 1:
- [Placeholder description] (only include if explicitly mentioned)
- [Another placeholder] (only include if mentioned)

SECTION 2:
- [More placeholders] (only include if mentioned)

(Final instructions about handling missing information)`}
                className="min-h-[400px] flex-1 font-mono text-sm"
              />
            </div>

          </CardContent>
        </Card>

        {/* Help Panel */}
        <Card className="flex w-[30%] flex-col border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Template Writing Guide</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex items-start gap-3">
              <Lightbulb className="mt-0.5 size-5 text-blue-600" />
              <div className="space-y-3 text-sm">
                <div className="space-y-2">
                  <div>
                    <strong>Placeholders:</strong>
                    {' '}
                    Use
                    <code className="rounded bg-blue-100 px-1">[description]</code>
                    {' '}
                    for content
                  </div>
                  <div>
                    <strong>Anti-hallucination:</strong>
                    {' '}
                    Add
                    <code className="rounded bg-blue-100 px-1">(only include if mentioned)</code>
                    {' '}
                    after placeholders
                  </div>
                  <div>
                    <strong>Example:</strong>
                    {' '}
                    <code className="rounded bg-blue-100 px-1">- [Patient's complaint] (only include if explicitly mentioned)</code>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
