"use client";
import * as React from 'react';

import { Grid } from '@/src/shared/components/layout/Grid';
import { Input } from '@/src/shared/components/ui/input';
import { ToolCard } from '@/src/features/tools/components/ToolCard';
import type { ToolDetail } from '@/src/features/tools/data/tools';

export function ToolsIndexClient({ tools }: { tools: ToolDetail[] }) {
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tools;
    return tools.filter((t) => [t.name, t.tagline, t.id].some((v) => v?.toLowerCase().includes(q)));
  }, [query, tools]);

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex-1">
          <Input placeholder="Search tools…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <button className="text-sm text-muted-foreground cursor-not-allowed" title="Coming soon">
          Submit a tool (coming soon)
        </button>
      </div>

      <Grid cols={4} gap="lg" className="mb-10">
        {filtered.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </Grid>
    </>
  );
}
