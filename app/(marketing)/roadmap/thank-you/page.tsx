'use client';

import Link from 'next/link';

export default function RoadmapThankYouPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">
          Thanks for joining the waitlist
        </h1>
        <p className="text-text-secondary mb-8">
          We&apos;ll notify you when Inbox Intelligence is available.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          Go back to home page
        </Link>
      </div>
    </div>
  );
}
