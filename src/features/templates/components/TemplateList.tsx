'use client';

import { Edit, MoreVertical, Plus, Star } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';

import type { Template } from '../types';

type TemplateListProps = {
  templates: Template[];
  selectedTemplate: Template | null;
  onTemplateSelect: (template: Template) => void;
  onTemplateHover: (template: Template) => void;
  isSignedIn: boolean;
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
  onCopy: (template: Template) => void;
  userDefaultTemplateId: string | null;
  onSetDefault: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  onCreateNew: () => void;
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
  onCreateNew,
}: TemplateListProps) {
  const filteredTemplates = templates;

  return (
    <div className="space-y-2">
      {/* Template Items */}
      {filteredTemplates.map((template) => {
        const isSelected = selectedTemplate?.id === template.id;
        const isDefault = userDefaultTemplateId === template.id;
        const originalIdx = templates.findIndex(t => t.id === template.id);

        return (
          <div
            key={template.id}
            className={cn(
              'group flex items-center gap-3 rounded-lg border p-3 transition-all duration-200 cursor-pointer',
              isSelected
                ? 'border-slate-300 bg-slate-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
            )}
            onClick={() => onTemplateSelect(template)}
            onMouseEnter={() => onTemplateHover(template)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onTemplateSelect(template);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Select template: ${template.name}`}
          >
            {/* Template Info */}
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h4 className={cn(
                  'text-sm font-medium truncate',
                  isSelected ? 'text-slate-900' : 'text-slate-700',
                )}
                >
                  {template.name}
                </h4>
                {isDefault && (
                  <span title="Default Template">
                    <Star className="size-3 fill-amber-500 text-amber-500" />
                  </span>
                )}
              </div>
              {template.description && (
                <p className="truncate text-xs text-slate-500">
                  {template.description}
                </p>
              )}
              <div className="mt-1 flex items-center gap-2">
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded',
                  template.type === 'default'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700',
                )}
                >
                  {template.type === 'default' ? 'Default' : 'Custom'}
                </span>
                {template.templateBody && (
                  <span className="text-xs text-slate-400">
                    {template.templateBody.length.toLocaleString()}
                    {' '}
                    chars
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {template.type !== 'default' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(template);
                  }}
                  className="size-7 p-0 opacity-0 transition-opacity hover:bg-slate-200 group-hover:opacity-100"
                  title="Edit template"
                >
                  <Edit className="size-3" />
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-7 p-0 opacity-0 transition-opacity hover:bg-slate-200 group-hover:opacity-100"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  >
                    <MoreVertical className="size-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onCopy(template)}>
                    Copy Template
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onSetDefault(template.id)}
                    disabled={isDefault}
                  >
                    {isDefault ? 'Default Template' : 'Set as Default'}
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
                    <>
                      <div className="my-1 border-t border-slate-100" />
                      <DropdownMenuItem onClick={() => onDelete(template)}>
                        <span className="text-red-600">Delete Template</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}

      {/* Create New Button */}
      <div className="border-t border-slate-200 pt-2">
        <Button
          variant="outline"
          className="h-10 w-full justify-start gap-2 border-dashed border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
          onClick={onCreateNew}
        >
          <Plus className="size-4" />
          Create New Template
        </Button>
      </div>
    </div>
  );
}
