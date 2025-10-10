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
          <div className="flex items-center gap-2">
            {tool.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tool.logoUrl} alt="" className="h-5 w-5 rounded-sm" />
            ) : null}
            <CardTitle>{tool.name}</CardTitle>
          </div>
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
          {tool.logoUrl /* just to keep order stable */}
          <Button asChild variant="secondary" size="sm" disabled={!tool['relatedPromptsUrl']} title={!tool['relatedPromptsUrl'] ? 'Coming soon' : undefined}>
            {tool['relatedPromptsUrl'] ? (
              <Link href={tool['relatedPromptsUrl']!}>View prompts</Link>
            ) : (
              <span>View prompts</span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
