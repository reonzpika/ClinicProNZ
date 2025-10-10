import Link from 'next/link';
import * as React from 'react';

import { Badge } from '@/src/shared/components/ui/badge';
import { Button } from '@/src/shared/components/ui/button';

import type { ToolDetail } from '../data/tools';

export function ToolDetailHeader({ tool }: { tool: ToolDetail }) {
  return (
    <header className="mb-6 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {tool.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tool.logoUrl} alt="" className="h-8 w-8 rounded-sm" />
          ) : null}
          <h1 className="text-2xl font-bold">{tool.name}</h1>
        </div>
        {tool.isFree && <Badge>Free</Badge>}
      </div>
      {tool.subtitle && <p className="text-sm text-muted-foreground">{tool.subtitle}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild size="sm">
          <a href={tool.tryUrl} target="_blank" rel="noopener noreferrer">Try</a>
        </Button>
        {tool.relatedPromptsUrl ? (
          <Button asChild variant="secondary" size="sm">
            <Link href={tool.relatedPromptsUrl}>View prompts</Link>
          </Button>
        ) : (
          <Button variant="secondary" size="sm" disabled title="Coming soon">View prompts</Button>
        )}
        <Button variant="secondary" size="sm" disabled title="Coming soon">Discuss in community</Button>
        <Button asChild variant="secondary" size="sm">
          <Link href="/tools">Back to tools</Link>
        </Button>
      </div>
    </header>
  );
}
