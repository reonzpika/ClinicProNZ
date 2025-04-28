'use client';

import { Check, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';

import type { Template } from '../types';

type TemplateListProps = {
  searchQuery: string;
  selectedTemplate: Template;
  onTemplateSelect: (template: Template) => void;
  onTemplateHover: (template: Template) => void;
  isSignedIn: boolean;
};

export function TemplateList({
  searchQuery,
  selectedTemplate,
  onTemplateSelect,
  onTemplateHover,
  isSignedIn,
}: TemplateListProps) {
  // TODO: Replace with actual data from API
  const defaultTemplates: Template[] = [
    { id: '1', name: 'Multi-problem SOAP (Default)', type: 'default' },
    { id: '2', name: 'Driver\'s License Medical', type: 'default' },
    { id: '3', name: 'Mental Health Review', type: 'default' },
    { id: '4', name: 'Initial Medical', type: 'default' },
  ];

  const customTemplates: Template[] = isSignedIn
    ? [
        { id: '5', name: 'Custom SOAP Template', type: 'custom' },
        { id: '6', name: 'Follow-up Template', type: 'custom' },
      ]
    : [];

  const filteredDefaultTemplates = defaultTemplates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredCustomTemplates = customTemplates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* Default Templates Section */}
      <div>
        <h3 className="mb-2 font-medium">Default Templates</h3>
        <div className="space-y-1">
          {filteredDefaultTemplates.map(template => (
            <Button
              key={template.id}
              variant="ghost"
              className={cn(
                'w-full justify-start gap-2',
                selectedTemplate?.id === template.id && 'bg-accent',
              )}
              onClick={() => onTemplateSelect(template)}
              onMouseEnter={() => onTemplateHover(template)}
            >
              {selectedTemplate?.id === template.id && (
                <Check className="size-4" />
              )}
              {template.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Templates Section */}
      <div>
        <h3 className="mb-2 font-medium">My Templates</h3>
        {isSignedIn ? (
          <div className="space-y-1">
            {filteredCustomTemplates.map(template => (
              <Button
                key={template.id}
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-2',
                  selectedTemplate?.id === template.id && 'bg-accent',
                )}
                onClick={() => onTemplateSelect(template)}
                onMouseEnter={() => onTemplateHover(template)}
              >
                {selectedTemplate?.id === template.id && (
                  <Check className="size-4" />
                )}
                {template.name}
              </Button>
            ))}
            <Button
              variant="ghost"
              className="text-primary w-full justify-start gap-2"
              onClick={() => { /* TODO: Handle create template */ }}
            >
              <Plus className="size-4" />
              Create New Template
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Log in to create and use custom templates
          </p>
        )}
      </div>
    </div>
  );
}
