'use client';

import { CheckCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function ReferralImagesSuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams?.get('session_id');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!sessionId) {
      // No session ID, redirect immediately
      router.push('/referral-images/capture');
      return;
    }

    // Countdown redirect
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push('/referral-images/capture');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionId, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        <div className="mb-6 flex justify-center">
          <CheckCircle className="size-16 text-green-500" />
        </div>

        <h1 className="mb-4 text-2xl font-bold text-text-primary">
          Thank You for Your Support! 🎉
        </h1>

        <p className="mb-6 text-text-secondary">
          Your payment was successful. You now have:
        </p>

        <div className="mb-6 rounded-lg bg-surface p-6 text-left">
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="font-bold text-green-500">✓</span>
              <span>Unlimited referral images forever</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-green-500">✓</span>
              <span>All future features automatically</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-green-500">✓</span>
              <span>Priority early access to our upcoming Inbox AI tool</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-green-500">✓</span>
              <span>Our deepest gratitude</span>
            </li>
          </ul>
        </div>

        <p className="mb-6 text-sm text-text-tertiary">
          No more limits. No more prompts. Just capture as many images as you need.
        </p>

        <p className="mb-4 text-text-secondary">
          Redirecting to capture page in
{' '}
{countdown}
{' '}
seconds...
        </p>

        <button
          onClick={() => router.push('/referral-images/capture')}
          className="w-full rounded-lg bg-primary px-6 py-3 text-white transition-colors hover:bg-primary-dark"
        >
          Continue to Capture
        </button>

        <p className="mt-6 text-sm text-text-tertiary">
          Thank you for supporting GP-built healthcare solutions.
        </p>
      </div>
    </div>
  );
}

export default function ReferralImagesSuccessPage() {
  return (
    <Suspense
      fallback={(
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-text-secondary">Loading...</p>
        </div>
      )}
    >
      <ReferralImagesSuccessPageContent />
    </Suspense>
  );
}
