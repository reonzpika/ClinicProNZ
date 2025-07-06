import { ArrowLeft, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';

import type { TemplateGenerationResponse } from '../types';

type TemplateFromDescriptionProps = {
  onTemplateGenerated: (templateBody: string, title?: string, description?: string) => void;
  onCancel: () => void;
};

const TEMPLATE_TYPES = [
  { value: 'general', label: 'General Consultation' },
  { value: 'specialist', label: 'Specialist Referral' },
  { value: 'followup', label: 'Follow-up Visit' },
  { value: 'preventive', label: 'Preventive Care' },
  { value: 'chronic', label: 'Chronic Disease Management' },
  { value: 'emergency', label: 'Emergency/Urgent Care' },
  { value: 'mental-health', label: 'Mental Health' },
  { value: 'pediatric', label: 'Pediatric Care' },
  { value: 'womens-health', label: 'Women\'s Health' },
  { value: 'other', label: 'Other/Custom' },
];

export function TemplateFromDescription({ onTemplateGenerated, onCancel }: TemplateFromDescriptionProps) {
  const [description, setDescription] = useState('');
  const [templateType, setTemplateType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateTemplate = async () => {
    if (!description.trim()) {
      setError('Please describe what kind of template you need.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/templates/generate-from-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description.trim(),
          templateType: templateType || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate template from description');
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

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Create Template from Description</h2>
            <p className="mt-1 text-sm text-slate-600">
              Describe what you need and let AI generate a template structure.
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
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Template Generator</h3>
          </div>

          <p className="text-sm text-slate-600">
            Describe what kind of template you need, and our AI will create a structured template for you with an appropriate title and description.
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="template-type">Template Type (Optional)</Label>
              <Select value={templateType} onValueChange={setTemplateType} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template type to help guide the AI..." />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Template Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={isLoading}
                placeholder="Describe what kind of template you need...

Examples:
• 'Create a template for dermatology consultations with detailed skin examination sections'
• 'I need a template for diabetes follow-up visits including HbA1c monitoring and medication review'
• 'Template for mental health assessments with mood evaluation and risk assessment'
• 'Pediatric vaccination visit template with developmental milestones'
• 'Template for pre-operative assessments including cardiac risk evaluation'"
                rows={8}
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
                disabled={isLoading || !description.trim()}
                className="flex-1"
              >
                {isLoading
                  ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Generating Template...
                      </>
                    )
                  : (
                      <>
                        <Sparkles className="mr-2 size-4" />
                        Generate Template
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
