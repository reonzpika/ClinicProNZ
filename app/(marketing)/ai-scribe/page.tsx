import Link from 'next/link';

import { Container } from '@/src/shared/components/layout/Container';
import { Button } from '@/src/shared/components/ui/button';

export default function AiScribeLandingPage() {
  return (
    <Container size="md" className="py-10">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">AI Scribe</h1>
          <p className="text-slate-600">
            Finish on time. Capture the consult; get a clean draft note fast.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <ul className="list-disc space-y-1 pl-5">
            <li>Faster notes for complex consults</li>
            <li>Less cognitive load; more patient focus</li>
            <li>Consistent structure for letters and follow-up</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/ai-scribe/consultation">Open AI Scribe</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href="/ai-scribe/image">Clinical images (in scribe)</Link>
          </Button>
        </div>

        <div className="text-sm text-slate-600">
          <Link href="/privacy" className="underline hover:text-slate-800">Privacy</Link>
        </div>
      </div>
    </Container>
  );
}
