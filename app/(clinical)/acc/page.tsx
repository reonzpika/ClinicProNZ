import Link from 'next/link';

import { Container } from '@/src/shared/components/layout/Container';
import { Button } from '@/src/shared/components/ui/button';

export default function AccToolsIndexPage() {
  return (
    <Container size="md" className="py-10">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">ACC Tools</h1>
          <p className="text-slate-600">Quick utilities for ACC45 workflows.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Employer lookup</h2>
            <p className="mt-1 text-sm text-slate-600">Find employer address fields quickly.</p>
            <div className="mt-4">
              <Button asChild>
                <Link href="/acc/employer-lookup">Open</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Occupation codes</h2>
            <p className="mt-1 text-sm text-slate-600">Search ACC occupation codes (typos ok) and copy the code.</p>
            <div className="mt-4">
              <Button asChild>
                <Link href="/acc/occupation-codes">Open</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
