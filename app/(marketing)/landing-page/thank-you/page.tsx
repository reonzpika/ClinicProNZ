'use client';

import { SignUp } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

export default function SurveyThankYouPage() {
  const params = useSearchParams();
  const fromSurvey = params.get('from_survey') || undefined;
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-2xl font-semibold">Thanks — that’s a huge help.</h1>
      <p className="mb-6 text-gray-700">
        ClinicPro’s AI scribe is <strong>free to use now</strong>, and we’re rolling out more features shortly.
        Create your account below to get access now.
      </p>
      {fromSurvey && (
        <p className="mb-4 text-sm text-gray-600">Personalised for: {fromSurvey}</p>
      )}
      <div className="rounded border p-4">
        <SignUp routing="hash" redirectUrl="/consultation" />
      </div>
    </main>
  );
}

