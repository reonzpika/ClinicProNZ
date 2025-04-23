'use client';

import { ArrowDown, ArrowUp, Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { TemplateSection } from '@/types/templates';

type SectionBuilderProps = {
  section: TemplateSection;
  onChange: (section: TemplateSection) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
};

export function SectionBuilder({
  section,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: SectionBuilderProps) {
  const handleChange = (field: keyof TemplateSection, value: string | number) => {
    onChange({
      ...section,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-4">
          <div>
            <label
              htmlFor={`section-title-${section.id}`}
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <Input
              id={`section-title-${section.id}`}
              value={section.title}
              onChange={e => handleChange('title', e.target.value)}
              placeholder="Section title"
              className="mt-1"
            />
          </div>
          <div>
            <label
              htmlFor={`section-content-${section.id}`}
              className="block text-sm font-medium text-gray-700"
            >
              Content
            </label>
            <Textarea
              id={`section-content-${section.id}`}
              value={section.content}
              onChange={e => handleChange('content', e.target.value)}
              placeholder="Section content"
              className="mt-1 min-h-[100px]"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {onMoveUp && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onMoveUp}
              title="Move section up"
            >
              <ArrowUp className="size-4" />
            </Button>
          )}
          {onMoveDown && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onMoveDown}
              title="Move section down"
            >
              <ArrowDown className="size-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onDelete}
            className="text-red-500 hover:text-red-600"
            title="Delete section"
          >
            <Trash className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
