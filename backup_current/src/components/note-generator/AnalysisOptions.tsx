import type { FC } from 'react';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CONCISE_OPTIONS } from '@/config/conciseOptions';
import { analysisLevels } from '@/types/analysis-levels';
import { cn } from '@/utils/ui';

type AnalysisOptionsProps = {
  analysisLevel: string;
  conciseLevel: string;
  onAnalysisLevelChange: (value: string) => void;
  onConciseLevelChange: (value: string) => void;
  className?: string;
};

export const AnalysisOptions: FC<AnalysisOptionsProps> = ({
  analysisLevel,
  conciseLevel,
  onAnalysisLevelChange,
  onConciseLevelChange,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <Label>Analysis Level</Label>
        <Select
          value={analysisLevel}
          onValueChange={onAnalysisLevelChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select analysis level" />
          </SelectTrigger>
          <SelectContent>
            {analysisLevels.map(level => (
              <SelectItem
                key={level.id}
                value={level.id}
              >
                <div className="space-y-1">
                  <div className="font-medium">
                    {level.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {level.description}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Conciseness Level</Label>
        <Select
          value={conciseLevel}
          onValueChange={onConciseLevelChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select conciseness level" />
          </SelectTrigger>
          <SelectContent>
            {CONCISE_OPTIONS.map(option => (
              <SelectItem
                key={option.id}
                value={option.id}
              >
                <div className="space-y-1">
                  <div className="font-medium">
                    {option.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {option.description}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
