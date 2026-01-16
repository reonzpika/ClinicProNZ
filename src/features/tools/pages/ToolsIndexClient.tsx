'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { ToolCard } from '@/src/features/tools/components/ToolCard';
import type { ToolDetail } from '@/src/features/tools/data/tools';
import { Grid } from '@/src/shared/components/layout/Grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { Input } from '@/src/shared/components/ui/input';

type UiCategory = 'ai-scribe' | 'search' | 'acc';

const CATEGORY_OPTIONS: Array<{ id: UiCategory; label: string }> = [
  { id: 'ai-scribe', label: 'AI scribe' },
  { id: 'search', label: 'AI search' },
  { id: 'acc', label: 'ACC' },
];

export function ToolsIndexClient({ tools }: { tools: ToolDetail[] }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<UiCategory>>(new Set());

  const toggleCategory = (id: UiCategory) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
 next.delete(id);
} else {
 next.add(id);
}
      return next;
    });
  };

  const activeToolCategories = useMemo(() => {
    const onlyAcc = selected.size > 0 && [...selected].every(c => c === 'acc');
    if (onlyAcc) {
 return new Set<string>();
}
    const set = new Set<string>();
    if (selected.size === 0 || selected.has('ai-scribe')) {
 set.add('ai-scribe');
}
    if (selected.size === 0 || selected.has('search')) {
 set.add('search');
}
    return set;
  }, [selected]);

  const showAcc = selected.size === 0 || selected.has('acc');
  const onlyAccSelected = selected.size > 0 && [...selected].every(c => c === 'acc');

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (onlyAccSelected) {
 return [] as ToolDetail[];
}
    return tools
      .filter(t => activeToolCategories.has(t.category))
      .filter((t) => {
        if (!q) {
 return true;
}
        return [t.name, t.tagline, t.id]
          .some(v => v?.toLowerCase().includes(q));
      });
  }, [query, tools, activeToolCategories, onlyAccSelected]);

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex-1">
          <Input placeholder="Search tools…" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <button className="cursor-not-allowed text-sm text-muted-foreground" title="Coming soon">
          Submit a tool (coming soon)
        </button>
      </div>

      <div className="relative mb-6">
        <div className="-mx-4 overflow-x-auto px-4">
          <div className="flex items-center gap-2 py-1">
            {CATEGORY_OPTIONS.map((cat) => {
              const isActive = selected.has(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => toggleCategory(cat.id)}
                  className={
                    `whitespace-nowrap rounded-full border px-3 py-1 text-sm transition-colors ${
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'hover:bg-accent'}`
                  }
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[color:var(--background)] to-transparent" aria-hidden="true" />
      </div>

      <Grid cols={4} gap="lg" className="mb-10 grid-cols-2 lg:grid-cols-4">
        {filteredTools.map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </Grid>

      {showAcc && (
        <section className="mb-12">
          <h2 className="mb-3 text-lg font-semibold">ACC utilities</h2>
          <Grid cols={3} gap="lg" className="grid-cols-1 md:grid-cols-3">
            <Link href="/acc/employer-lookup" className="block rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
              <Card className="hover:bg-accent/40">
                <CardHeader>
                  <CardTitle>Employer lookup</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">Find employer details for ACC claims.</CardContent>
              </Card>
            </Link>

            <Link href="/acc/occupation-codes" className="block rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
              <Card className="hover:bg-accent/40">
                <CardHeader>
                  <CardTitle>ACC occupation codes</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">Search and select correct occupation codes.</CardContent>
              </Card>
            </Link>

            <a href="https://readcode.tubo.nz/" target="_blank" rel="noopener noreferrer" className="block rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
              <Card className="hover:bg-accent/40">
                <CardHeader>
                  <CardTitle>Read code browser</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">Browse Read codes for diagnosis selection.</CardContent>
              </Card>
            </a>
          </Grid>
        </section>
      )}
    </>
  );
}
