import type { Metadata } from 'next';
import * as React from 'react';

import { Container } from '@/src/shared/components/layout/Container';
import { ToolsIndexClient } from '@/src/features/tools/pages/ToolsIndexClient';
import { TOOL_LIST } from '@/src/features/tools/data/tools';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'GP AI Toolkit – Tools for NZ GPs',
  description:
    'Curated AI tools for General Practice. Fast evidence, communication, and admin helpers. Verify with guidelines; avoid PHI.',
};

export default function ToolsPage() {
  const filtered = TOOL_LIST; // server side constant
  return (
    <Container size="xl" className="py-8">
      {/* JSON-LD ItemList for SEO */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: filtered.map((t, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `https://clinicpro.nz/tools/${t.id}`,
              name: t.name,
            })),
          }),
        }}
      />
      <div className="mb-6">
        <div className="mb-2 text-sm text-muted-foreground">Home / Tools</div>
        <h1 className="mb-1 text-2xl font-bold">GP AI Toolkit</h1>
        <p className="text-sm text-muted-foreground">
          Work faster, stay evidence‑based. Verify with guidelines. Don’t paste identifiable data.
        </p>
      </div>

      <ToolsIndexClient tools={TOOL_LIST} />

      <section className="mb-12">
        <h2 className="mb-2 text-lg font-semibold">Community highlights</h2>
        <p className="text-sm text-muted-foreground">Coming soon</p>
      </section>

      <footer className="text-xs text-muted-foreground">
        <div className="mb-2">Last reviewed: {new Date().toLocaleDateString()}</div>
        <div>
          <a href="/prompts" className="underline">
            Explore prompts
          </a>{' '}
          · Community (coming soon)
        </div>
      </footer>
    </Container>
  );
}
