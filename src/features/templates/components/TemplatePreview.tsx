import { Card, CardContent } from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';

import type { Template } from '../types';

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

            {template.prompts?.structure && (
              <div>
                <h4 className="text-sm font-medium">Structure Prompt</h4>
                <pre className="whitespace-pre-wrap text-sm bg-muted p-2 rounded">{template.prompts.structure}</pre>
              </div>
            )}

            {template.prompts?.example && (
              <div>
                <h4 className="text-sm font-medium">Example Output</h4>
                <pre className="whitespace-pre-wrap text-xs bg-muted p-2 rounded">{template.prompts.example}</pre>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Sections</h4>
              <div className="space-y-2">
                {template.sections.map(section => (
                  <div key={section.name} className="rounded-md border p-2">
                    <h5 className="font-medium">{section.name}</h5>
                    <div className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                      {section.prompt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </ScrollArea>
  );
}
