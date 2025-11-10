import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';

import type { ToolDetail } from '../data/tools';

export function ToolDetailMain({ tool }: { tool: ToolDetail }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Good for (NZ)</CardTitle>
        </CardHeader>
        <CardContent>
          {tool.goodFor?.length
? (
            <div className="flex flex-wrap gap-2">
              {tool.goodFor.map(g => (
                <span key={g} className="rounded-full border px-2 py-0.5 text-xs">{g}</span>
              ))}
            </div>
          )
: (
            <div className="text-sm text-muted-foreground">Coming soon</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Limits (NZ)</CardTitle>
        </CardHeader>
        <CardContent>
          {tool.limits?.length
? (
            <ul className="list-disc pl-5 text-sm">
              {tool.limits.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          )
: (
            <div className="text-sm text-muted-foreground">Coming soon</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
