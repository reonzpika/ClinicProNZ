'use client';

import Link from 'next/link';

export default function RoadmapThankYouPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-4 text-2xl font-bold text-text-primary">
          Thanks for joining the waitlist
        </h1>
        <p className="mb-8 text-text-secondary">
          I&apos;ll email you when Inbox Intelligence launches. Applying for R&D funding now; fingers crossed.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-primary px-8 py-4 font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
