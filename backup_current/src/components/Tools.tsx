import { Calculator, FileText, Stethoscope } from 'lucide-react';
import React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type ToolsProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
};

const TOOL_CATEGORIES = [
  {
    id: 'calculators',
    name: 'Medical Calculators',
    icon: Calculator,
    description: 'Risk assessments and clinical scores',
  },
  {
    id: 'clinical',
    name: 'Clinical Tools',
    icon: Stethoscope,
    description: 'Assessment tools and guidelines',
  },
  {
    id: 'resources',
    name: 'NZ Resources',
    icon: FileText,
    description: 'Local guidelines and pathways',
  },
] as const;

export function Tools({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
}: ToolsProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <Input
          type="search"
          placeholder="Search tools..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="mb-2"
        />
        <div className="grid gap-4">
          {TOOL_CATEGORIES.map(category => (
            <div
              key={category.id}
              className="flex min-h-[100px] items-center justify-center rounded-lg border border-dashed p-8 text-center"
            >
              <div className="space-y-2">
                <category.icon className="mx-auto size-8 text-muted-foreground/60" />
                <h3 className="text-sm font-medium">{category.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                  <span className="ml-1 text-xs">(Coming Soon)</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
