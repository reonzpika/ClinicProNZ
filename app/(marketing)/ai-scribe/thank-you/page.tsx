'use client';

import Link from 'next/link';

export default function AiScribeThankYouPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">
          Thanks for signing up
        </h1>
        <p className="text-text-secondary mb-8">
          I&apos;ll email you when it&apos;s ready to launch. In the meantime, try Referral Images; it&apos;s live and free.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
