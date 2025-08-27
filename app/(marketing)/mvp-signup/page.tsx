'use client';

import { useSearchParams } from 'next/navigation';

export default function MVPSignupPage() {
  const params = useSearchParams();
  const fromSurvey = params.get('from_survey');
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-2xl font-semibold">MVP Signup</h1>
      <p className="text-gray-700">
        Thanks — ClinicPro’s AI scribe is free to use now, and we’re rolling out more features shortly.
        Sign up keeps you updated.
      </p>
      {fromSurvey && (
        <p className="mt-3 text-sm text-gray-600">Personalised for: {fromSurvey}</p>
      )}
      {/* TODO: Integrate actual signup form or redirect to Clerk sign up */}
    </main>
  );
}

