'use client';

import { SignUp, useAuth } from '@clerk/nextjs';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

import { Button } from '@/src/shared/components/ui/button';

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const hasClerk = typeof clerkPublishableKey === 'string' && clerkPublishableKey.trim().length > 0;

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

function ConsultationCTABox() {
  const router = useRouter();
  return (
    <div className="rounded border p-4">
      <Button
        size="lg"
        onClick={() => router.push('/consultation')}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-2xl"
      >
        Start Clinical Documentation
        <ArrowRight className="ml-2 size-5" />
      </Button>
    </div>
  );
}

export default function SurveyThankYouPage() {
  if (!hasClerk) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="mb-2 text-2xl font-semibold">Thanks — that's a huge help.</h1>
        <p className="mb-6 text-gray-700">
          ClinicPro's smart scribe and image tools are <strong>free to use now</strong>, and we're rolling out more features shortly.
        </p>
        <ConsultationCTABox />
      </main>
    );
  }

  const { isSignedIn, isLoaded } = useAuth();

  // Loading state
  if (!isLoaded) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-blue-300 border-t-blue-600"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-2xl font-semibold">Thanks — that's a huge help.</h1>

      {isSignedIn
? (
        <>
          <p className="mb-6 text-gray-700">
            ClinicPro's smart scribe and image tools are
            {' '}
            <strong>ready to use now</strong>
            , and we're rolling out more features shortly.
          </p>
          <ConsultationCTABox />
        </>
      )
: (
        <>
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
        </>
      )}
    </main>
  );
}
