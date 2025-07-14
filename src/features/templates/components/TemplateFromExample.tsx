import { ArrowLeft, FileText, Loader2, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Alert } from '@/src/shared/components/ui/alert';
import { Button } from '@/src/shared/components/ui/button';
import { Label } from '@/src/shared/components/ui/label';
import { Textarea } from '@/src/shared/components/ui/textarea';

import type { TemplateGenerationResponse } from '../types';

type TemplateFromExampleProps = {
  onTemplateGenerated: (templateBody: string, title?: string, description?: string) => void;
  onCancel: () => void;
};

type ExampleNote = {
  id: string;
  content: string;
};

export function TemplateFromExample({ onTemplateGenerated, onCancel }: TemplateFromExampleProps) {
  const [examples, setExamples] = useState<ExampleNote[]>([
    { id: '1', content: '' },
  ]);
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addExample = () => {
    if (examples.length < 5) {
      const newId = (examples.length + 1).toString();
      setExamples([...examples, { id: newId, content: '' }]);
    }
  };

  const removeExample = (id: string) => {
    if (examples.length > 1) {
      setExamples(examples.filter(example => example.id !== id));
    }
  };

  const updateExample = (id: string, content: string) => {
    setExamples(examples.map(example =>
      example.id === id ? { ...example, content } : example,
    ));
  };

  const handleGenerateTemplate = async () => {
    const validExamples = examples.filter(example => example.content.trim());

    if (validExamples.length === 0) {
      setError('Please provide at least one consultation note example.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/templates/extract-from-example', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examples: validExamples.map(example => example.content.trim()),
          additionalInstructions: additionalInstructions.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to extract template from examples');
      }

      // Call onTemplateGenerated with templateBody instead of dsl
      const generatedTemplate: TemplateGenerationResponse = data;
      onTemplateGenerated(generatedTemplate.templateBody, generatedTemplate.title, generatedTemplate.description);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const hasValidExamples = examples.some(example => example.content.trim());

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Create Template from Examples</h2>
            <p className="mt-1 text-sm text-slate-600">
              Upload example consultation notes and let AI extract the structure.
            </p>
          </div>
          <Button variant="outline" onClick={onCancel} disabled={isLoading} className="h-9">
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Example Analyser</h3>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Paste example consultation notes below, and our AI will analyse their structure to create a reusable template that matches your documentation style.
            </p>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="mb-2 font-medium text-blue-900">What makes good examples:</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>
                  •
                  <strong>Similar consultation types</strong>
                  {' '}
                  (e.g., all general consultations or all follow-ups)
                </li>
                <li>
                  •
                  <strong>Your typical documentation style</strong>
                  {' '}
                  - use your normal headings, abbreviations, and formatting
                </li>
                <li>
                  •
                  <strong>Complete notes</strong>
                  {' '}
                  with all sections you usually include
                </li>
                <li>
                  •
                  <strong>Consistent structure</strong>
                  {' '}
                  across examples to help identify your patterns
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            {examples.map((example, index) => (
              <div key={example.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`example-${example.id}`}>
                    Example
                    {' '}
                    {index + 1}
                    {' '}
                    {index === 0 && '*'}
                  </Label>
                  {examples.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExample(example.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
                <Textarea
                  id={`example-${example.id}`}
                  value={example.content}
                  onChange={e => updateExample(example.id, e.target.value)}
                  placeholder={`Paste consultation notes here...

Example:
S// c/o chest pain x 2/7
O// \\bp 120/80 \\p 72 \\wt 70kg, chest clear
A// ?musculoskeletal chest pain
P// paracetamol 500mg QID, f/u 1/52`}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
            ))}

            {examples.length < 5 && (
              <Button
                variant="outline"
                onClick={addExample}
                className="w-full"
              >
                <Plus className="mr-2 size-4" />
                Add Another Example (
                {examples.length}
                /5)
              </Button>
            )}

            <div>
              <Label htmlFor="additional-instructions">Additional Instructions (Optional)</Label>
              <Textarea
                id="additional-instructions"
                value={additionalInstructions}
                onChange={e => setAdditionalInstructions(e.target.value)}
                placeholder="Any specific requirements for the template structure...

Example:
- Focus on cardiovascular assessments
- Include detailed medication history section
- Add follow-up planning subsection"
                rows={4}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <div>{error}</div>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleGenerateTemplate}
                disabled={isLoading || !hasValidExamples}
                className="flex-1"
              >
                {isLoading
                  ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Analysing Examples...
                      </>
                    )
                  : (
                      <>
                        <Sparkles className="mr-2 size-4" />
                        Extract Template
                      </>
                    )}
              </Button>
              <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
