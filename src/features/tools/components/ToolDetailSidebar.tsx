import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';

import type { ToolDetail } from '../data/tools';

export function ToolDetailSidebar({ tool }: { tool: ToolDetail }) {
  return (
    <aside className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Key info</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <dl className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Website</dt>
              <dd>
                {tool.website ? (
                  <a className="underline" href={tool.website} target="_blank" rel="noopener noreferrer">Visit</a>
                ) : (
                  <span>—</span>
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Platforms</dt>
              <dd>{tool.keyInfo?.platforms?.join(', ') ?? '—'}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Account required</dt>
              <dd>{tool.keyInfo?.accountRequired ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related prompts</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Coming soon</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Community</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Coming soon</CardContent>
      </Card>
    </aside>
  );
}
