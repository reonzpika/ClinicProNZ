'use client';

import Link from 'next/link';

import { Container } from '@/src/shared/components/layout/Container';
import { Button } from '@/src/shared/components/ui/button';

export default function StandaloneImagesPlaceholderPage() {
  return (
    <Container size="md" className="py-10">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Clinical Images (Standalone)</h1>
          <p className="text-slate-600">
            This standalone Images tool is being rebuilt. For now, use Images inside AI Scribe.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/ai-scribe/image">Open Images in AI Scribe</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/image">Back to Images landing</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}

