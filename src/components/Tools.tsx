import React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type ToolsProps = {
  toolsSearchQuery: string;
  setToolsSearchQuery: (query: string) => void;
  activeToolsCategory: string;
  setActiveToolsCategory: (category: string) => void;
};

export function Tools({
  toolsSearchQuery,
  setToolsSearchQuery,
}: ToolsProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <Input
          type="search"
          placeholder="Search tools..."
          value={toolsSearchQuery}
          onChange={e => setToolsSearchQuery(e.target.value)}
          className="mb-2"
        />
        {/* Add more tool-related content here */}
      </CardContent>
    </Card>
  );
}
