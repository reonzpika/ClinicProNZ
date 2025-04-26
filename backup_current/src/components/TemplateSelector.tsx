'use client';

import { Check, ChevronDown, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { NoteTemplate } from '@/types';

type TemplateSelectorProps = {
  templates: NoteTemplate[];
  selectedTemplate: string | null;
  onSelect: (templateId: string) => void;
  disabled?: boolean;
};

// Group templates by type
const groupTemplates = (templates: NoteTemplate[]) => {
  const defaultTemplate = templates.find(t => t.id === 'multi-problem-soap');
  const specificTemplates = templates.filter(t => t.id !== 'multi-problem-soap');

  return {
    defaultTemplate,
    specificTemplates,
  };
};

export function TemplateSelector({
  templates,
  selectedTemplate,
  onSelect,
  disabled = false,
}: TemplateSelectorProps) {
  const selected = templates.find(t => t.id === selectedTemplate);
  const { defaultTemplate, specificTemplates } = groupTemplates(templates);

  const handleSelect = (templateId: string) => {
    onSelect(templateId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="w-[200px] justify-between"
        >
          {selected?.name || 'Select Template'}
          <ChevronDown className="ml-2 size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {defaultTemplate && (
          <>
            <DropdownMenuLabel>Default Template</DropdownMenuLabel>
            <DropdownMenuItem
              key={defaultTemplate.id}
              onSelect={() => handleSelect(defaultTemplate.id)}
              className="justify-between"
            >
              <span>{defaultTemplate.name}</span>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="size-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{defaultTemplate.description}</p>
                    <ul className="mt-1 text-xs">
                      {defaultTemplate.structure.sections.map(section => (
                        <li key={section.key}>{section.label}</li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
                {defaultTemplate.id === selectedTemplate && (
                  <Check className="size-4" />
                )}
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Specific Templates</DropdownMenuLabel>
          </>
        )}

        {specificTemplates.map(template => (
          <DropdownMenuItem
            key={template.id}
            onSelect={() => handleSelect(template.id)}
            className="justify-between"
          >
            <span>{template.name}</span>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger>
                  <Info className="size-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{template.description}</p>
                  <ul className="mt-1 text-xs">
                    {template.structure.sections.map(section => (
                      <li key={section.key}>{section.label}</li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
              {template.id === selectedTemplate && (
                <Check className="size-4" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
