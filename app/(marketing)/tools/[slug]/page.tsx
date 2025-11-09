import { notFound } from 'next/navigation';
import * as React from 'react';

import { ToolDetailHeader } from '@/src/features/tools/components/ToolDetailHeader';
import { ToolDetailMain } from '@/src/features/tools/components/ToolDetailMain';
import { ToolDetailSidebar } from '@/src/features/tools/components/ToolDetailSidebar';
import { getToolById, TOOL_LIST } from '@/src/features/tools/data/tools';
import { Container } from '@/src/shared/components/layout/Container';
import { Grid } from '@/src/shared/components/layout/Grid';

export function generateStaticParams() {
  return TOOL_LIST.map(t => ({ slug: t.id }));
}

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getToolById(slug);
  if (!tool) {
 return notFound();
}

  return (
    <Container size="xl" className="py-8">
      <ToolDetailHeader tool={tool} />
      <Grid cols={3} gap="lg" className="grid-cols-1 items-start lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ToolDetailMain tool={tool} />
        </div>
        <div className="lg:col-span-1">
          <ToolDetailSidebar tool={tool} />
        </div>
      </Grid>

      <footer className="mt-8 text-xs text-muted-foreground">
        <div className="mb-2">
Last reviewed:
{new Date(tool.lastReviewed ?? Date.now()).toLocaleDateString()}
        </div>
        <div>
          Explore prompts (coming soon) · Community (coming soon)
        </div>
      </footer>
    </Container>
  );
}
