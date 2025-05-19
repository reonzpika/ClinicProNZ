'use client';

import { Edit, MoreVertical, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';

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
    <div className="space-y-0 divide-y divide-gray-200">
      {filteredTemplates.map((template) => {
        const isSelected = selectedTemplate?.id === template.id;
        const originalIdx = templates.findIndex(t => t.id === template.id);
        return (
          <div
            key={template.id}
            className={cn(
              'flex items-center justify-between px-2 py-1 min-h-[36px] cursor-pointer',
              isSelected ? 'bg-blue-100' : '',
              !isSelected && 'hover:bg-muted',
              'transition-colors',
            )}
            style={{ fontSize: '0.85rem' }}
          >
            <Button
              variant="ghost"
              className={cn('flex-1 justify-start gap-2 px-0 py-0 h-auto min-w-0')}
              onClick={() => onTemplateSelect(template)}
              onMouseEnter={() => onTemplateHover(template)}
              style={{ fontSize: '0.85rem', minWidth: 0 }}
            >
              <span className={cn('truncate max-w-[160px] text-xs', isSelected ? 'font-semibold' : 'font-medium')}>
                {template.name}
              </span>
              {userDefaultTemplateId === template.id && (
                <span title="Default Template" aria-label="Default Template" className="ml-1 text-xs font-semibold text-yellow-500">★</span>
              )}
            </Button>
            <div className="ml-1 flex items-center gap-0">
              {template.type !== 'default' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(template)}
                  title="Edit"
                  className="p-0.5"
                >
                  <Edit className="size-4" />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onCopy(template)}>
                    Copy
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onSetDefault(template.id)}
                    disabled={userDefaultTemplateId === template.id}
                  >
                    {userDefaultTemplateId === template.id ? 'Default Template' : 'Set as Default'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => originalIdx > 0 && onReorder(originalIdx, originalIdx - 1)}
                    disabled={originalIdx === 0}
                  >
                    Move Up
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => originalIdx < templates.length - 1 && onReorder(originalIdx, originalIdx + 1)}
                    disabled={originalIdx === templates.length - 1}
                  >
                    Move Down
                  </DropdownMenuItem>
                  {template.type !== 'default' && (
                    <DropdownMenuItem onClick={() => onDelete(template)}>
                      <span className="text-red-600 hover:bg-red-50">Delete</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}
      <Button
        variant="ghost"
        className="mt-2 w-full justify-start gap-2 text-xs text-primary"
        onClick={() => onEdit({} as Template)}
      >
        <Plus className="size-4" />
        Create New Template
      </Button>
    </div>
  );
}
