import Link from 'next/link';
import Image from 'next/image';
import * as React from 'react';

import { Badge } from '@/src/shared/components/ui/badge';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { cn } from '@/src/lib/utils';

import type { ToolDetail } from '../data/tools';

export type ToolCardProps = {
  tool: ToolDetail;
  className?: string;
};

export function ToolCard({ tool, className }: ToolCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="space-y-1 p-0">
        <Link href={`/tools/${tool.id}`} className="block rounded-md p-3 hover:bg-accent/40 focus:outline-none focus:ring-2 focus:ring-ring">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {tool.logoUrl ? (
                <Image src={tool.logoUrl} alt="" width={20} height={20} className="rounded-sm" />
              ) : null}
              <CardTitle>{tool.name}</CardTitle>
            </div>
            {/* Free badge removed per request */}
          </div>
          <CardDescription className="mt-1">{tool.tagline}</CardDescription>
        </Link>
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="mb-2 text-[10px] text-muted-foreground">Reviewed {tool.updatedAt ? new Date(tool.updatedAt).toLocaleDateString(undefined, { month: '2-digit', year: 'numeric' }) : '—'}</div>
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href={`/tools/${tool.id}`}>View details</Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            size="sm"
            disabled={!tool.relatedPromptsUrl}
            title={!tool.relatedPromptsUrl ? 'Coming soon' : undefined}
          >
            {tool.relatedPromptsUrl ? (
              <Link href={tool.relatedPromptsUrl}>View prompts</Link>
            ) : (
              <span>View prompts</span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
