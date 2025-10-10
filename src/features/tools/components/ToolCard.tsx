import Link from 'next/link';
import * as React from 'react';

import { Badge } from '@/src/shared/components/ui/badge';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { cn } from '@/src/lib/utils';

import type { ToolSummary } from '../data/tools';

export type ToolCardProps = {
  tool: ToolSummary;
  className?: string;
};

export function ToolCard({ tool, className }: ToolCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{tool.name}</CardTitle>
          {tool.isFree && <Badge>Free</Badge>}
        </div>
        <CardDescription>{tool.tagline}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <a href={tool.tryUrl} target="_blank" rel="noopener noreferrer">Try</a>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/tools/${tool.id}`}>View details</Link>
          </Button>
          <Button variant="secondary" size="sm" disabled title="Coming soon">Copy prompts</Button>
        </div>
      </CardContent>
    </Card>
  );
}
