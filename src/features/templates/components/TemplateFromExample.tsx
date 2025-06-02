import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Alert } from '@/shared/components/ui/alert';
import { Loader2, FileText, Sparkles } from 'lucide-react';

import type { TemplateDSL } from '../types';
import { TemplatePreview } from './TemplatePreview';

type TemplateFromExampleProps = {
  onTemplateGenerated: (dsl: TemplateDSL, title?: string, description?: string) => void;
  onCancel: () => void;
};

export function TemplateFromExample({ onTemplateGenerated, onCancel }: TemplateFromExampleProps) {
  const [exampleNotes, setExampleNotes] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedDsl, setGeneratedDsl] = useState<TemplateDSL | null>(null);

  const handleExtractTemplate = async () => {
    if (!exampleNotes.trim()) {
      setError('Please paste some consultation notes to analyze.');
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
          exampleNotes: exampleNotes.trim(),
          additionalInstructions: additionalInstructions.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to extract template from example');
      }

      setGeneratedDsl(data.dsl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptTemplate = () => {
    if (generatedDsl) {
      onTemplateGenerated(generatedDsl);
    }
  };

  const handleTryAgain = () => {
    setGeneratedDsl(null);
    setError(null);
  };

  if (generatedDsl) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">Template Extracted Successfully</h3>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Review the extracted template structure below. You can accept it as-is or go back to try with different notes.
        </p>

        <TemplatePreview template={{
          id: 'preview',
          name: 'Generated Template Preview',
          description: 'Preview of extracted template structure',
          type: 'custom',
          dsl: generatedDsl
        }} />

        <div className="flex gap-3">
          <Button onClick={handleAcceptTemplate} className="flex-1">
            Accept Template
          </Button>
          <Button variant="outline" onClick={handleTryAgain}>
            Try Again
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Create Template from Example</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Paste an example consultation note below, and our AI will analyze its structure to create a reusable template.
      </p>

      <div className="space-y-4">
        <div>
          <Label htmlFor="example-notes">Example Consultation Notes *</Label>
          <Textarea
            id="example-notes"
            value={exampleNotes}
            onChange={e => setExampleNotes(e.target.value)}
            placeholder="Paste your consultation notes here...

Example:
Chief Complaint: Patient presents with chest pain
History: 45-year-old male with 2-day history of central chest pain...
Examination: Vital signs stable, chest clear...
Assessment: Likely musculoskeletal chest pain
Plan: Paracetamol, follow up in 1 week"
            rows={12}
            className="font-mono text-sm"
          />
        </div>

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
            onClick={handleExtractTemplate} 
            disabled={isLoading || !exampleNotes.trim()}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Notes...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
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
  );
} 