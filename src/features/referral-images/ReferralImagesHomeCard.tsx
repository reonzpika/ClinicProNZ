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
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"
          aria-hidden
        />
      )}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <h2
            className={`font-semibold text-text-primary ${
              isPrimary ? 'text-3xl md:text-4xl' : 'text-lg'
            }`}
          >
            Referral Images
          </h2>
          <span className="text-sm font-medium text-text-secondary">Live • Free for GPs</span>
        </div>

        <p className={`text-text-secondary mb-6 ${isPrimary ? 'text-lg' : 'text-sm'}`}>
          Phone to desktop in 30 seconds. Free for GPs.
        </p>

        <Button
          asChild
          variant="outline"
          className="w-full border-primary text-primary hover:bg-primary/10 hover:scale-[1.02] transition-all"
        >
          <Link href="/referral-images" className="inline-flex items-center justify-center">
            {isLoaded && userId ? 'Open' : 'Start Free'}
            <ChevronRight className="ml-2 h-5 w-5" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}
