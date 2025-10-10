import * as React from 'react';

import { Container } from '@/src/shared/components/layout/Container';
import { Grid } from '@/src/shared/components/layout/Grid';
import { Input } from '@/src/shared/components/ui/input';
import { ToolCard } from '@/src/features/tools/components/ToolCard';
import { TOOL_LIST } from '@/src/features/tools/data/tools';

export const dynamic = 'force-static';

export default function ToolsPage() {
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOOL_LIST;
    return TOOL_LIST.filter((t) =>
      [t.name, t.tagline, t.id].some((v) => v?.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <Container size="xl" className="py-8">
      <div className="mb-6">
        <div className="mb-2 text-sm text-muted-foreground">Home / Tools</div>
        <h1 className="mb-1 text-2xl font-bold">GP AI Toolkit</h1>
        <p className="text-sm text-muted-foreground">Work faster, stay evidence‑based. Verify with guidelines. Don’t paste identifiable data.</p>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search tools…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button className="text-sm text-muted-foreground cursor-not-allowed" title="Coming soon">Submit a tool (coming soon)</button>
      </div>

      <Grid cols={4} gap="lg" className="mb-10">
        {filtered.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </Grid>

      <section className="mb-12">
        <h2 className="mb-2 text-lg font-semibold">Community highlights</h2>
        <p className="text-sm text-muted-foreground">Coming soon</p>
      </section>

      <footer className="text-xs text-muted-foreground">
        <div className="mb-2">Last reviewed: {new Date().toLocaleDateString()}</div>
        <div>
          Explore prompts (coming soon) · Community (coming soon)
        </div>
      </footer>
    </Container>
  );
}
