import { ChevronDown, ChevronUp, Edit2, Eye, EyeOff } from 'lucide-react';
import type { FC } from 'react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Template, TemplateSection } from '@/types/templates';
import { cn } from '@/utils/ui';

type TemplatePreviewProps = {
  template: Template & { sections: TemplateSection[] };
  variables: Record<string, any>;
  sectionConfig?: {
    id: number;
    visible: boolean;
    order: number;
  }[];
  className?: string;
  onVariableQuickEdit?: (name: string, value: any) => void;
};

const SAMPLE_DATA = {
  patientName: 'John Smith',
  age: '45',
  dateOfVisit: '2024-03-20',
  chiefComplaint: 'Lower back pain',
  symptoms: 'Persistent lower back pain, worse in the morning',
  duration: '2 weeks',
  medications: 'Ibuprofen 400mg PRN',
  allergies: 'None known',
  pastHistory: 'Hypertension, controlled with medication',
};

export const TemplatePreview: FC<TemplatePreviewProps> = ({
  template,
  variables,
  sectionConfig,
  className,
  onVariableQuickEdit,
}) => {
  const [collapsedSections, setCollapsedSections] = useState<number[]>([]);
  const [showSampleData, setShowSampleData] = useState(false);
  const [editingVariable, setEditingVariable] = useState<string | null>(null);

  // Process sections based on configuration
  const processedSections = useMemo(() => {
    const sections = [...template.sections];

    if (sectionConfig) {
      return sections
        .filter(section =>
          sectionConfig.find(config =>
            config.id === section.id && config.visible,
          ),
        )
        .sort((a, b) => {
          const aConfig = sectionConfig.find(config => config.id === a.id);
          const bConfig = sectionConfig.find(config => config.id === b.id);
          return (aConfig?.order ?? 0) - (bConfig?.order ?? 0);
        });
    }

    return sections.sort((a, b) => a.order - b.order);
  }, [template.sections, sectionConfig]);

  // Interpolate variables in content
  const interpolateContent = (content: string) => {
    return content.replace(/\{\{(.*?)\}\}/g, (match, variable) => {
      const trimmedVar = variable.trim();
      const value = showSampleData
        ? SAMPLE_DATA[trimmedVar] ?? variables[trimmedVar]
        : variables[trimmedVar];
      return value ?? `{{${trimmedVar}}}`;
    });
  };

  const toggleSection = (sectionId: number) => {
    setCollapsedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  const handleQuickEdit = (name: string, value: any) => {
    onVariableQuickEdit?.(name, value);
    setEditingVariable(null);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Template Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold">{template.name}</h3>
          {template.description && (
            <p className="mt-1 text-muted-foreground">
              {template.description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary">
              {template.type}
            </Badge>
            {template.isSystem && (
              <Badge variant="outline" className="border-blue-200 text-blue-700">
                System
              </Badge>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSampleData(!showSampleData)}
        >
          {showSampleData ? <EyeOff className="mr-2 size-4" /> : <Eye className="mr-2 size-4" />}
          {showSampleData ? 'Hide Sample' : 'Show Sample'}
        </Button>
      </div>

      {/* Preview Area */}
      <Card className="relative">
        <ScrollArea className="h-[400px] p-4">
          <div className="space-y-6">
            {processedSections.map((section) => {
              const isCollapsed = collapsedSections.includes(section.id);
              return (
                <div key={section.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">
                      {interpolateContent(section.title)}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection(section.id)}
                    >
                      {isCollapsed
                        ? (
                            <ChevronDown className="size-4" />
                          )
                        : (
                            <ChevronUp className="size-4" />
                          )}
                    </Button>
                  </div>
                  {!isCollapsed && (
                    <div className="whitespace-pre-wrap">
                      {interpolateContent(section.content)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </Card>

      {/* Variable Status */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Variables</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(template.variables).map(([name, variable]) => {
            const isSet = variables[name] !== undefined;
            const isEditing = editingVariable === name;

            return (
              <div key={name} className="flex items-center">
                {isEditing
                  ? (
                      <Input
                        size="sm"
                        className="h-8 w-32"
                        defaultValue={variables[name] ?? ''}
                        onBlur={e => handleQuickEdit(name, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleQuickEdit(name, e.currentTarget.value);
                          }
                        }}
                        autoFocus
                      />
                    )
                  : (
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge
                            variant={isSet ? 'default' : 'outline'}
                            className={cn(
                              'cursor-help transition-colors group relative',
                              !isSet && 'text-muted-foreground',
                            )}
                            onClick={() => onVariableQuickEdit && setEditingVariable(name)}
                          >
                            {name}
                            {variable.required && !isSet && ' *'}
                            {onVariableQuickEdit && (
                              <Edit2 className="ml-1 inline-block size-3 opacity-0 group-hover:opacity-100" />
                            )}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{variable.label}</p>
                          {variable.description && (
                            <p className="text-xs text-muted-foreground">{variable.description}</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
