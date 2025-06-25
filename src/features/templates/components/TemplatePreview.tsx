import { FileText } from 'lucide-react';

import { Card, CardContent } from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';

import type { Template } from '../types';

type TemplatePreviewProps = {
  template: Template;
};

export function TemplatePreview({ template }: TemplatePreviewProps) {

  // Analyze template content
  const placeholders = template.templateBody.match(/\[([^\]]+)\]/g) || [];
  const hasInstructions = template.templateBody.includes('(') && template.templateBody.includes(')');

  return (
    <div className="flex h-full min-h-0 flex-col">

      <Card className="flex h-full min-h-0 flex-col">
        <CardContent className="flex h-full min-h-0 flex-col p-4">
          <ScrollArea className="h-full min-h-0 flex-1">
            <div className="space-y-4">
              {/* Template Info */}
              <div className="border-b pb-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{template.name || 'Untitled Template'}</h3>
                  <div className="flex gap-1">
                    {placeholders.length > 0 && (
                      <Badge variant="secondary">{placeholders.length} placeholders</Badge>
                    )}
                    {hasInstructions && (
                      <Badge variant="default">Protected</Badge>
                    )}
                  </div>
                </div>
                {template.description && (
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>
                )}
              </div>

              {/* Template Structure View */}
              <div className="space-y-4">
                {template.templateBody.trim() ? (
                  <>
                    <div>
                      <h4 className="mb-2 text-sm font-medium flex items-center gap-2">
                        <FileText className="size-4" />
                        Template Structure
                      </h4>
                      <div className="rounded border bg-muted/50 p-3">
                        <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                          {template.templateBody}
                        </pre>
                      </div>
                    </div>

                    {/* Placeholder Analysis */}
                    {placeholders.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium">Detected Placeholders</h4>
                        <div className="space-y-1">
                          {placeholders.slice(0, 10).map((placeholder, index) => (
                            <div key={index} className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded">
                              {placeholder}
                            </div>
                          ))}
                          {placeholders.length > 10 && (
                            <div className="text-xs text-muted-foreground">
                              ... and {placeholders.length - 10} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="size-12 mx-auto mb-2 opacity-50" />
                    <p>Start typing to see your template structure</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
