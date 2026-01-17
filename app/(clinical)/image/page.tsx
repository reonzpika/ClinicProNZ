import Link from 'next/link';

import { Container } from '@/src/shared/components/layout/Container';
import { Button } from '@/src/shared/components/ui/button';

export default function ImageLandingPage() {
  return (
    <Container size="md" className="py-10">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Clinical Images</h1>
          <p className="text-slate-600">
            Capture and upload clinical photos quickly. Free to start; sign up required so you can access your images from any device.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/image/app">Start free</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href="/privacy">Privacy</Link>
          </Button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div className="font-medium text-slate-900">Freemium</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Free tier available immediately</li>
            <li>Upgrade later if you need more</li>
            <li>Medtech integration is a separate upgrade</li>
          </ul>
        </div>
      </div>
    </Container>
  );
}

