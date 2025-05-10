'use client';

import { Check, Copy, Edit, Plus, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';

import type { Template } from '../types';

type TemplateListProps = {
  templates: Template[];
  selectedTemplate: Template;
  onTemplateSelect: (template: Template) => void;
  onTemplateHover: (template: Template) => void;
  isSignedIn: boolean;
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
  onCopy: (template: Template) => void;
  userDefaultTemplateId: string | null;
  onSetDefault: (id: string) => void;
  onReorder: (from: number, to: number) => void;
};

export function TemplateList({
  templates,
  selectedTemplate,
  onTemplateSelect,
  onTemplateHover,
  onEdit,
  onDelete,
  onCopy,
  userDefaultTemplateId,
  onSetDefault,
  onReorder,
}: TemplateListProps) {
  const filteredTemplates = templates;

  return (
    <div className="space-y-1">
      {filteredTemplates.map((template) => {
        const isDefault = template.type === 'default';
        const originalIdx = templates.findIndex(t => t.id === template.id);
        return (
          <div
            key={template.id}
            className={cn(
              'flex items-center gap-2 rounded px-2 py-1',
              isDefault ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200',
              selectedTemplate?.id === template.id && 'bg-accent',
            )}
          >
            <Button
              variant="ghost"
              className={cn('flex-1 justify-start gap-2', selectedTemplate?.id === template.id && 'bg-accent')}
              onClick={() => onTemplateSelect(template)}
              onMouseEnter={() => onTemplateHover(template)}
            >
              {selectedTemplate?.id === template.id && <Check className="size-4" />}
              {template.name}
              {userDefaultTemplateId === template.id && (
                <span title="Default Template" aria-label="Default Template" className="ml-1 text-xs font-semibold text-yellow-500">★</span>
              )}
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSetDefault(template.id)}
              title={userDefaultTemplateId === template.id ? 'This is your default template' : 'Set as default template'}
              aria-label={userDefaultTemplateId === template.id ? 'This is your default template' : 'Set as default template'}
              disabled={userDefaultTemplateId === template.id}
            >
              <span role="img" aria-label="Set as default" className={userDefaultTemplateId === template.id ? 'text-yellow-500' : ''}>★</span>
            </Button>
            {/* Reorder buttons */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => originalIdx > 0 && onReorder(originalIdx, originalIdx - 1)}
              title="Move up"
              aria-label="Move up"
              disabled={originalIdx === 0}
            >
              ↑
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => originalIdx < templates.length - 1 && onReorder(originalIdx, originalIdx + 1)}
              title="Move down"
              aria-label="Move down"
              disabled={originalIdx === templates.length - 1}
            >
              ↓
            </Button>
          </div>
        );
      })}
      <Button
        variant="ghost"
        className="text-primary mt-2 w-full justify-start gap-2"
        onClick={() => onEdit({} as Template)}
      >
        <Plus className="size-4" />
        Create New Template
      </Button>
    </div>
  );
}
