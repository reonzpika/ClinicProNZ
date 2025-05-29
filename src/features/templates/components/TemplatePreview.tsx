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
    <div className="flex h-full min-h-0 flex-col">
      <Card className="flex h-full min-h-0 flex-col">
        <CardContent className="flex h-full min-h-0 flex-col p-4">
          <ScrollArea className="h-full min-h-0 flex-1">
            <div className="space-y-2">
              <h3 className="mb-2 text-lg font-semibold">{template.name}</h3>
              <div>
                <h4 className="mb-1 text-xs font-medium">Description</h4>
                <div className="text-sm text-muted-foreground">
                  {template.description?.replace(/\\n/g, '\n').split('\n').map((line, index) => (
                    <div key={index} className={index > 0 ? 'mt-1' : ''}>
                      {line.trim() || '\u00A0'}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Example Output Section */}
              <div>
                <h4 className="mb-1 text-xs font-medium">Example Output</h4>
                {template.prompts.example ? (
                  <pre className="whitespace-pre-wrap rounded bg-muted p-2 text-xs">
                    {template.prompts.example}
                  </pre>
                ) : (
                  <div className="rounded bg-muted p-2 text-xs text-muted-foreground italic">
                    No example output available for this template
                  </div>
                )}
              </div>

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
                  <h4 className="mt-2 text-xs font-medium">System Prompt (as sent to AI)</h4>
                  <pre className="mb-1 whitespace-pre-wrap rounded bg-muted p-1 text-xs">
                    {SYSTEM_PROMPT}
                  </pre>
                  <h4 className="mt-2 text-xs font-medium">Full Final Prompt (as sent to AI)</h4>
                  <pre className="whitespace-pre-wrap rounded bg-muted p-1 text-xs">
                    {buildTemplatePrompt(template.prompts, sampleTranscription, sampleQuickNotes)}
                  </pre>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
