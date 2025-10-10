import * as React from 'react';

import { Container } from '@/src/shared/components/layout/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';

export default function PromptsPage() {
  return (
    <Container size="xl" className="py-8">
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
