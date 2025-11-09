import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { Button } from '@/src/shared/components/ui/button';

import type { ToolDetail } from '../data/tools';

export function ToolDetailHeader({ tool }: { tool: ToolDetail }) {
  return (
    <header className="mb-6 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {tool.logoUrl
? (
            <Image src={tool.logoUrl} alt="" width={32} height={32} className="rounded-sm" />
          )
: null}
          <h1 className="text-2xl font-bold">{tool.name}</h1>
        </div>
        {/* Free badge removed per request */}
      </div>
      {tool.subtitle && <p className="text-sm text-muted-foreground">{tool.subtitle}</p>}
      <div className="flex flex-wrap items-center gap-2">
        {/* Try button removed per request */}
        {/* View prompts removed per request */}
        <Button variant="secondary" size="sm" disabled title="Coming soon">Discuss in community</Button>
        <Button asChild variant="secondary" size="sm">
          <Link href="/tools">Back to tools</Link>
        </Button>
      </div>
    </header>
  );
}
