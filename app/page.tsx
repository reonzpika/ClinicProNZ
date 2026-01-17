import Link from 'next/link';

import { Container } from '@/src/shared/components/layout/Container';
import { Button } from '@/src/shared/components/ui/button';

export default function HomePage() {
  return (
    <Container size="md" className="py-10">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">ClinicPro</h1>
          <p className="text-slate-600">A set of practical tools for NZ general practice.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-900">AI Scribe</h2>
            <p className="mt-1 text-sm text-slate-600">Finish notes faster; stay focused on the patient.</p>
            <div className="mt-4 space-y-2">
              <Button asChild className="w-full">
                <Link href="/ai-scribe">Open</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Clinical Images</h2>
            <p className="mt-1 text-sm text-slate-600">Get photos captured and sorted quickly; reduce referral friction.</p>
            <div className="mt-4 space-y-2">
              <Button asChild className="w-full">
                <Link href="/image">Start free</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-900">ACC Tools</h2>
            <p className="mt-1 text-sm text-slate-600">Spend less time hunting codes and addresses; submit faster.</p>
            <div className="mt-4 space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link href="/acc">Open</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:gap-4">
          <Link href="/landing-page" className="underline hover:text-slate-800">Digital scribing</Link>
          <Link href="/roadmap" className="underline hover:text-slate-800">Updates</Link>
          <Link href="/privacy" className="underline hover:text-slate-800">Privacy</Link>
        </div>
      </div>
    </Container>
  );
}
