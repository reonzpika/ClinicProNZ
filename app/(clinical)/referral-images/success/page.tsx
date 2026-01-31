'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-text-primary mb-4">
          Thank You for Your Support! 🎉
        </h1>

        <p className="text-text-secondary mb-6">
          Your payment was successful. You now have:
        </p>

        <div className="bg-surface rounded-lg p-6 mb-6 text-left">
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold">✓</span>
              <span>Unlimited referral images forever</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold">✓</span>
              <span>All future features automatically</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold">✓</span>
              <span>Priority early access to our upcoming Inbox AI tool</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold">✓</span>
              <span>Our deepest gratitude</span>
            </li>
          </ul>
        </div>

        <p className="text-text-tertiary text-sm mb-6">
          No more limits. No more prompts. Just capture as many images as you need.
        </p>

        <p className="text-text-secondary mb-4">
          Redirecting to capture page in {countdown} seconds...
        </p>

        <button
          onClick={() => router.push('/referral-images/capture')}
          className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Continue to Capture
        </button>

        <p className="text-text-tertiary text-sm mt-6">
          Thank you for supporting GP-built healthcare solutions.
        </p>
      </div>
    </div>
  );
}

export default function ReferralImagesSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <p className="text-text-secondary">Loading...</p>
        </div>
      }
    >
      <ReferralImagesSuccessPageContent />
    </Suspense>
  );
}
