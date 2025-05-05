import { Card, CardContent } from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';

import type { Template } from '../types';
import { buildTemplatePrompt } from '../utils/promptBuilder';

type TemplatePreviewProps = {
  template: Template;
};

export function TemplatePreview({ template }: TemplatePreviewProps) {
  return (
    <ScrollArea className="h-[400px]">
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">{template.name}</h3>
              <p className="text-muted-foreground text-sm">{template.description}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Prompt Preview</h4>
              <pre className="whitespace-pre-wrap text-sm bg-muted p-2 rounded">
                {buildTemplatePrompt(template)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </ScrollArea>
  );
}
