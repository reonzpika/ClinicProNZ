import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TemplateService } from '@/services/template.service';
import type { TemplateWithSections } from '@/types/templates';

type TemplateBrowserProps = {
  onSelectTemplate: (template: TemplateWithSections) => void;
  className?: string;
};

export const TemplateBrowser: FC<TemplateBrowserProps> = ({
  onSelectTemplate,
  className,
}) => {
  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => TemplateService.getAllWithSectionsByUserId('system'), // Using system templates for now
  });

  if (isLoading) {
    return <div>Loading templates...</div>;
  }

  if (!templates?.length) {
    return <div>No templates found</div>;
  }

  return (
    <Card className={className}>
      <ScrollArea className="h-[400px] p-4">
        <div className="space-y-4">
          {templates.map(template => (
            <div
              key={template.id}
              className="cursor-pointer rounded-lg p-4 hover:bg-gray-100"
              onClick={() => onSelectTemplate(template)}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{template.name}</h3>
                <Badge variant={template.isSystem ? 'default' : 'secondary'}>
                  {template.isSystem ? 'System' : 'Custom'}
                </Badge>
              </div>
              {template.description && (
                <p className="mt-1 text-sm text-gray-500">{template.description}</p>
              )}
              <div className="mt-2 flex gap-2">
                <Badge variant="outline">{template.type}</Badge>
                <Badge variant="outline">
                  v
                  {template.version}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
