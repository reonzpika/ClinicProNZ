'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function LaunchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const context = searchParams.get('context');
    const signature = searchParams.get('signature');

    if (!context || !signature) {
      setError('Missing launch parameters. Please launch this from Medtech Evolution.');
      return;
    }

    fetch(`/api/medtech/launch/start?context=${encodeURIComponent(context)}&signature=${encodeURIComponent(signature)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) {
          throw new Error(data?.error || 'Failed to initialise launch session');
        }
        router.replace('/medtech-images');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Launch initialisation failed');
      });
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-lg rounded-lg border border-red-200 bg-white p-6">
          <h1 className="text-lg font-semibold text-red-700">Launch failed</h1>
          <p className="mt-2 text-sm text-slate-700">{error}</p>
          <p className="mt-4 text-xs text-slate-500">
            Tip: ensure a patient is selected in Medtech before clicking the ClinicPro Images icon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-sm text-slate-700">Loading patient context...</div>
    </div>
  );
}

export default function LaunchPage() {
  return (
    <Suspense
      fallback={(
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="text-sm text-slate-700">Loading...</div>
        </div>
      )}
    >
      <LaunchPageContent />
    </Suspense>
  );
}

