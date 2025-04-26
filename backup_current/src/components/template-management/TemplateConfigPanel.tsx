import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';
import type { FC } from 'react';
import { useCallback, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { Template, TemplateSection, TemplateVariable } from '@/types/templates';
import { cn } from '@/utils/ui';

type TemplateConfigPanelProps = {
  template: Template & { sections: TemplateSection[] };
  variables: Record<string, TemplateVariable>;
  onConfigChange: (config: TemplateConfig) => void;
  className?: string;
};

export type TemplateConfig = {
  variables: Record<string, any>;
  sections: {
    id: number;
    visible: boolean;
    order: number;
  }[];
};

export const TemplateConfigPanel: FC<TemplateConfigPanelProps> = ({
  template,
  variables,
  onConfigChange,
  className,
}) => {
  // State for variable values and section configuration
  const [variableValues, setVariableValues] = useState<Record<string, any>>(() => {
    const initialValues: Record<string, any> = {};
    Object.entries(variables).forEach(([key, variable]) => {
      initialValues[key] = variable.defaultValue;
    });
    return initialValues;
  });

  const [sectionConfig, setSectionConfig] = useState<TemplateConfig['sections']>(() =>
    template.sections.map((section, index) => ({
      id: section.id,
      visible: true,
      order: index,
    })),
  );

  // Handle variable changes
  const handleVariableChange = useCallback((name: string, value: any) => {
    setVariableValues((prev) => {
      const newValues = { ...prev, [name]: value };
      onConfigChange({
        variables: newValues,
        sections: sectionConfig,
      });
      return newValues;
    });
  }, [sectionConfig, onConfigChange]);

  // Handle section visibility toggle
  const handleSectionVisibility = useCallback((sectionId: number, visible: boolean) => {
    setSectionConfig((prev) => {
      const newConfig = prev.map(section =>
        section.id === sectionId ? { ...section, visible } : section,
      );
      onConfigChange({
        variables: variableValues,
        sections: newConfig,
      });
      return newConfig;
    });
  }, [variableValues, onConfigChange]);

  // Handle section reordering
  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(sectionConfig);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const newConfig = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setSectionConfig(newConfig);
    onConfigChange({
      variables: variableValues,
      sections: newConfig,
    });
  }, [sectionConfig, variableValues, onConfigChange]);

  // Render variable input based on type
  const renderVariableInput = (name: string, variable: TemplateVariable) => {
    switch (variable.type) {
      case 'boolean':
        return (
          <Switch
            checked={!!variableValues[name]}
            onCheckedChange={value => handleVariableChange(name, value)}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={variableValues[name]}
            onChange={e => handleVariableChange(name, e.target.value)}
            required={variable.required}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={variableValues[name]}
            onChange={e => handleVariableChange(name, e.target.value)}
            required={variable.required}
          />
        );
      default:
        return (
          <Input
            type="text"
            value={variableValues[name]}
            onChange={e => handleVariableChange(name, e.target.value)}
            placeholder={variable.description}
            required={variable.required}
          />
        );
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Variables Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Variables</h3>
        <div className="grid gap-4">
          {Object.entries(variables).map(([name, variable]) => (
            <div key={name} className="space-y-2">
              <Label htmlFor={name}>
                {variable.label}
                {variable.required && <span className="ml-1 text-red-500">*</span>}
              </Label>
              {renderVariableInput(name, variable)}
              {variable.description && (
                <p className="text-sm text-muted-foreground">
                  {variable.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sections Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Sections</h3>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections">
            {provided => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {template.sections
                  .map((section, index) => {
                    const config = sectionConfig.find(s => s.id === section.id);
                    if (!config) {
                      return null;
                    }

                    return (
                      <Draggable
                        key={section.id}
                        draggableId={section.id.toString()}
                        index={index}
                      >
                        {provided => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex items-center gap-4 rounded-lg border bg-card p-3"
                          >
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="size-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{section.title}</h4>
                            </div>
                            <Switch
                              checked={config.visible}
                              onCheckedChange={value =>
                                handleSectionVisibility(section.id, value)}
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};
