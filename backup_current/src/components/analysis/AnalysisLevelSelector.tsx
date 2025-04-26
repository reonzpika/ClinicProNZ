'use client';

import { useCallback } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { AnalysisLevelId } from '@/types/analysis-levels';
import { analysisLevels } from '@/types/analysis-levels';
import { cn } from '@/utils/ui';

type AnalysisLevelSelectorProps = {
  value: AnalysisLevelId;
  onChange: (value: AnalysisLevelId) => void;
  disabled?: boolean;
};

export function AnalysisLevelSelector({
  value,
  onChange,
  disabled = false,
}: AnalysisLevelSelectorProps) {
  const handleChange = useCallback(
    (newValue: string) => {
      onChange(newValue as AnalysisLevelId);
    },
    [onChange],
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Analysis Level</CardTitle>
        <CardDescription>
          Select the depth of analysis for the medical note
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={value}
          onValueChange={handleChange}
          className="grid gap-4 md:grid-cols-3"
          disabled={disabled}
        >
          {analysisLevels.map((level) => {
            const Icon = level.icon ? Icons[level.icon] : Icons.circle;
            return (
              <Label
                key={level.id}
                className={cn(
                  'flex flex-col items-start gap-4 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary',
                  disabled && 'opacity-50 cursor-not-allowed',
                )}
              >
                <RadioGroupItem value={level.id} id={level.id} className="sr-only" />
                <div className="flex w-full flex-row items-start gap-4">
                  <Icon className="size-5" />
                  <div className="flex-1 space-y-1">
                    <div className="text-sm font-medium leading-none">{level.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {level.description}
                    </div>
                  </div>
                </div>
                <ul className="ml-9 space-y-2 text-sm text-muted-foreground">
                  {level.features.map((feature, index) => (
                    <li key={index} className="list-disc">{feature}</li>
                  ))}
                </ul>
              </Label>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
