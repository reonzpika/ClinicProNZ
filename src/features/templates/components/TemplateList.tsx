'use client';

import { Check, Plus, Copy, Edit, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';

import type { Template } from '../types';

type TemplateListProps = {
  templates: Template[];
  searchQuery: string;
  selectedTemplate: Template;
  onTemplateSelect: (template: Template) => void;
  onTemplateHover: (template: Template) => void;
  isSignedIn: boolean;
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
  onCopy: (template: Template) => void;
};

export function TemplateList({
  templates,
  searchQuery,
  selectedTemplate,
  onTemplateSelect,
  onTemplateHover,
  isSignedIn,
  onEdit,
  onDelete,
  onCopy,
}: TemplateListProps) {
  const filteredDefaultTemplates = templates.filter(
    t => t.type === 'default' && t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCustomTemplates = templates.filter(
    t => t.type === 'custom' && t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Default Templates Section */}
      <div>
        <h3 className="mb-2 font-medium">Default Templates</h3>
        <div className="space-y-1">
          {filteredDefaultTemplates.map(template => (
            <div key={template.id} className="flex items-center gap-2">
              <Button
                variant="ghost"
                className={cn(
                  'flex-1 justify-start gap-2',
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
              <Button variant="ghost" size="icon" onClick={() => onCopy(template)} title="Copy">
                <Copy className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Templates Section */}
      <div>
        <h3 className="mb-2 font-medium">My Templates</h3>
        {isSignedIn ? (
          <div className="space-y-1">
            {filteredCustomTemplates.map(template => (
              <div key={template.id} className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className={cn(
                    'flex-1 justify-start gap-2',
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
                <Button variant="ghost" size="icon" onClick={() => onEdit(template)} title="Edit">
                  <Edit className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(template)} title="Delete">
                  <Trash2 className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onCopy(template)} title="Copy">
                  <Copy className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              className="text-primary w-full justify-start gap-2"
              onClick={() => onEdit(undefined)}
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
