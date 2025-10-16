import Link from 'next/link';
import Image from 'next/image';
import * as React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { cn } from '@/src/lib/utils';

import type { ToolDetail } from '../data/tools';

export type ToolCardProps = {
  tool: ToolDetail;
  className?: string;
};

export function ToolCard({ tool, className }: ToolCardProps) {
  return (
    <Link href={`/tools/${tool.id}`} className="block h-full rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
      <Card className={cn('flex h-full flex-col hover:bg-accent/40', className)}>
        <CardHeader className="space-y-1">
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
        </CardHeader>
        <CardContent className="mt-auto" />
      </Card>
    </Link>
  );
}
