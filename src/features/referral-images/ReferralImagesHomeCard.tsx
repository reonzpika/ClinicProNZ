'use client';

import { useAuth } from '@clerk/nextjs';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/src/shared/components/ui/button';

type ReferralImagesHomeCardProps = {
  variant?: 'default' | 'primary';
};

export function ReferralImagesHomeCard({ variant = 'default' }: ReferralImagesHomeCardProps) {
  const { userId, isLoaded } = useAuth();
  const isPrimary = variant === 'primary';

  return (
    <div
      className={`group relative bg-white p-5 transition-shadow hover:shadow-lg ${
        isPrimary
          ? 'rounded-2xl border border-border'
          : 'rounded-lg border border-border'
      }`}
    >
      {isPrimary && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent"
          aria-hidden
        />
      )}
      <div className="relative z-10">
        <div className="mb-3 flex items-center gap-3">
          <h2
            className={`font-semibold text-text-primary ${
              isPrimary ? 'text-3xl md:text-4xl' : 'text-lg'
            }`}
          >
            Referral Images
          </h2>
          <span className="text-sm font-medium text-text-secondary">Live • Free for GPs</span>
        </div>

        <p className={`mb-6 text-text-secondary ${isPrimary ? 'text-lg' : 'text-sm'}`}>
          Photo to desktop in 30 seconds. Saves &gt;10 minutes per referral.
        </p>

        <Button
          asChild
          variant="outline"
          className="w-full border-primary text-primary transition-all hover:scale-[1.02] hover:bg-primary/10"
        >
          <Link href="/referral-images" className="inline-flex items-center justify-center">
            {isLoaded && userId ? 'Open' : 'Start Free'}
            <ChevronRight className="ml-2 size-5" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}
