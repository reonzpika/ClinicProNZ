import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';

import type { ToolDetail } from '../data/tools';

export function ToolDetailMain({ tool }: { tool: ToolDetail }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          <p>{tool.overview ?? 'Coming soon'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Example workflows</CardTitle>
        </CardHeader>
        <CardContent>
          {tool.workflows?.length ? (
            <ul className="list-disc space-y-3 pl-5">
              {tool.workflows.map((wf) => (
                <li key={wf.title}>
                  <div className="font-medium">{wf.title}</div>
                  {wf.steps?.length ? (
                    <ol className="list-decimal pl-5 text-sm text-muted-foreground">
                      {wf.steps.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-muted-foreground">Coming soon</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tips for GPs</CardTitle>
        </CardHeader>
        <CardContent>
          {tool.tipsForGPs?.length ? (
            <ul className="list-disc space-y-2 pl-5 text-sm">
              {tool.tipsForGPs.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-muted-foreground">Coming soon</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
