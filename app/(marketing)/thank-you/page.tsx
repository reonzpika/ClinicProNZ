'use client';

import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Container } from '@/src/shared/components/layout/Container';
import { Button } from '@/src/shared/components/ui/button';

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(10);

  // Countdown timer for auto-redirect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.href = '/consultation';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-16">
      <Container size="sm">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto mb-8 flex size-20 items-center justify-center rounded-full bg-green-100">
            <Check className="size-10 text-green-600" />
          </div>

          {/* Main Message */}
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Welcome to ClinicPro Standard!
          </h1>

          <p className="mb-8 text-xl text-gray-600">
            Your payment was successful and your account has been upgraded.
          </p>

          {/* Personal Message - TODO for customisation */}
          <div className="mx-auto mb-8 max-w-2xl rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h2 className="mb-3 text-lg font-semibold text-blue-900">
              A Personal Message from Dr. Ryo
            </h2>
            <p className="leading-relaxed text-blue-800">
              {/* TODO: Replace with personalised message */}
              Thank you for joining ClinicPro Standard! You now have access to unlimited AI-powered consultations,
              all templates, and priority support. I'm excited to see how this transforms your practice and
              helps you provide even better care to your patients.
            </p>
            <p className="mt-3 text-sm text-blue-700">
              {/* TODO: Add more specific benefits or next steps */}
              If you have any questions or feedback, please don't hesitate to reach out.
            </p>
          </div>

          {/* What's Next Section */}
          <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 text-left">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              What's included in your Standard plan:
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-3">
                <Check className="size-4 text-green-600" />
                <span>1,000 AI requests per day (up from 20)</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="size-4 text-green-600" />
                <span>Access to all clinical templates</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="size-4 text-green-600" />
                <span>Real-time transcription with mobile sync</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="size-4 text-green-600" />
                <span>AI-generated consultation notes</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="size-4 text-green-600" />
                <span>Priority email support</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              asChild
              size="lg"
              className="bg-green-600 px-8 py-4 text-lg hover:bg-green-700"
            >
              <Link href="/consultation" className="flex items-center gap-2">
                Start Your First Consultation
                <ArrowRight className="size-5" />
              </Link>
            </Button>

            <p className="text-sm text-gray-500">
              Redirecting automatically in
              {' '}
              {countdown}
              {' '}
              seconds...
            </p>
          </div>

          {/* Session Info for Debugging */}
          {sessionId && (
            <div className="mt-8 text-xs text-gray-400">
              Session ID:
              {' '}
              {sessionId}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
