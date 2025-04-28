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

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Sections</h4>
              <div className="space-y-2">
                {template.sections.map(section => (
                  <div key={section.id} className="rounded-md border p-2">
                    <h5 className="font-medium">{section.name}</h5>
                    {section.prompts.map(prompt => (
                      <div key={prompt.id} className="mt-1 text-sm text-muted-foreground">
                        • {prompt.text}
                      </div>
                    ))}
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
