import { useState } from 'react';

import { Card, CardContent } from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';

import type { Template } from '../types';
import { buildTemplatePrompt, SYSTEM_PROMPT } from '../utils/promptBuilder';

type TemplatePreviewProps = {
  template: Template;
};

export function TemplatePreview({ template }: TemplatePreviewProps) {
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const sampleTranscription = 'This is a sample transcription of a general practice consultation.';
  const sampleQuickNotes = ['Sample quick note 1', 'Sample quick note 2'];

  return (
    <ScrollArea className="h-[400px]">
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Consultation Note Template</h3>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Instructions for the AI</h4>
              <pre className="whitespace-pre-wrap rounded bg-muted p-2 text-sm">
                {template.prompts.prompt}
              </pre>
            </div>
            {template.prompts.example && (
              <div>
                <h4 className="text-sm font-medium">Example Output</h4>
                <pre className="whitespace-pre-wrap rounded bg-muted p-2 text-sm">
                  {template.prompts.example}
                </pre>
              </div>
            )}
            <div>
              <button
                className="mt-2 text-xs text-blue-600 underline"
                onClick={() => setShowFullPrompt(v => !v)}
              >
                {showFullPrompt ? 'Hide Full Final Prompt' : 'Show Full Final Prompt (Advanced)'}
              </button>
            </div>
            {showFullPrompt && (
              <div>
                <h4 className="mt-2 text-sm font-medium">System Prompt (as sent to AI)</h4>
                <pre className="mb-2 whitespace-pre-wrap rounded bg-muted p-2 text-xs">
                  {SYSTEM_PROMPT}
                </pre>
                <h4 className="mt-2 text-sm font-medium">Full Final Prompt (as sent to AI)</h4>
                <pre className="whitespace-pre-wrap rounded bg-muted p-2 text-xs">
                  {buildTemplatePrompt(template.prompts, sampleTranscription, sampleQuickNotes)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </ScrollArea>
  );
}
