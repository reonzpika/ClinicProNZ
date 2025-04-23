'use client';

import { Plus, Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { TemplateVariable } from '@/types/templates';

type VariableManagerProps = {
  variables: TemplateVariable[];
  onChange: (variables: TemplateVariable[]) => void;
};

export function VariableManager({ variables, onChange }: VariableManagerProps) {
  const handleAddVariable = () => {
    onChange([
      ...variables,
      {
        name: '',
        type: 'text',
        defaultValue: '',
      },
    ]);
  };

  const handleRemoveVariable = (index: number) => {
    onChange(variables.filter((_, i) => i !== index));
  };

  const handleVariableChange = (
    index: number,
    field: keyof TemplateVariable,
    value: string,
  ) => {
    const updatedVariables = [...variables];
    updatedVariables[index] = {
      ...updatedVariables[index],
      [field]: value,
    };
    onChange(updatedVariables);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Template Variables</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddVariable}
          className="flex items-center gap-1"
        >
          <Plus className="size-4" />
          Add Variable
        </Button>
      </div>

      {variables.map((variable, index) => (
        <div
          key={index}
          className="flex items-start gap-4 rounded-lg border p-4"
        >
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <Input
                value={variable.name}
                onChange={e =>
                  handleVariableChange(index, 'name', e.target.value)}
                placeholder="Variable name"
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <Select
                value={variable.type}
                onValueChange={value =>
                  handleVariableChange(index, 'type', value)}
                className="mt-1"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="boolean">Boolean</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Default Value
              </label>
              <Input
                value={variable.defaultValue}
                onChange={e =>
                  handleVariableChange(index, 'defaultValue', e.target.value)}
                placeholder="Default value"
                className="mt-1"
              />
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleRemoveVariable(index)}
            className="text-red-500 hover:text-red-600"
          >
            <Trash className="size-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
