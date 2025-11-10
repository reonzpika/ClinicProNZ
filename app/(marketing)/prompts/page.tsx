import type { Metadata } from 'next';
import * as React from 'react';

import { Container } from '@/src/shared/components/layout/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';

export const metadata: Metadata = {
  title: 'Prompt Library – AI prompts for NZ GPs',
  description: 'Curated, copy-ready prompts for General Practice. Evidence, consult summaries, and patient comms. Verify with guidelines; avoid PHI.',
};

export default function PromptsPage() {
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
            'itemListElement': [
              { '@type': 'ListItem', 'position': 1, 'url': 'https://clinicpro.nz/prompts/evidence-and-guidelines', 'name': 'Evidence & guidelines' },
              { '@type': 'ListItem', 'position': 2, 'url': 'https://clinicpro.nz/prompts/clinical-qna-with-citations', 'name': 'Clinical Q&A with citations' },
              { '@type': 'ListItem', 'position': 3, 'url': 'https://clinicpro.nz/prompts/consult-summary-soap', 'name': 'Consult summary (SOAP)' },
            ],
          }),
        }}
      />
      <div className="mb-6">
        <div className="mb-2 text-sm text-muted-foreground">Home / Prompts</div>
        <h1 className="mb-1 text-2xl font-bold">Prompt Library</h1>
        <p className="text-sm text-muted-foreground">Curated prompts for GPs. Use responsibly; verify with guidelines.</p>
      </div>

      <section className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Evidence & guidelines</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Coming soon</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clinical Q&A with citations</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Coming soon</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consult summary (SOAP)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Coming soon</CardContent>
        </Card>
      </section>

      <footer className="mt-8 text-xs text-muted-foreground">
        <div>Community (coming soon)</div>
      </footer>
    </Container>
  );
}
