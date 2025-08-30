'use client';

import { SignUp } from '@clerk/nextjs';
import { Suspense } from 'react';

function SignUpBox() {
  return (
    <div className="rounded border p-4">
      <SignUp
        routing="hash"
        redirectUrl="/consultation"
        appearance={{
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
            card: 'bg-white shadow-xl border-0',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
            socialButtonsBlockButton: 'border-2 border-gray-300 hover:bg-gray-50 text-sm font-medium',
            formFieldInput: 'border-2 border-gray-300 focus:border-blue-500',
            footerActionLink: 'text-blue-600 hover:text-blue-700',
          },
        }}
      />
    </div>
  );
}

export default function SurveyThankYouPage() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-2xl font-semibold">Thanks — that’s a huge help.</h1>
      <p className="mb-6 text-gray-700">
        ClinicPro's smart scribe and image tools are
{' '}
<strong>free to use now</strong>
, and we're rolling out more features shortly.
        Create your account below to get access now.
      </p>

      <Suspense>
        <SignUpBox />
      </Suspense>
    </main>
  );
}
