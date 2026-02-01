'use client';

import { useAuth } from '@clerk/nextjs';
import { CheckCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/src/shared/components/ui/button';

const BULLETS = [
  '30 seconds phone→desktop',
  'Always JPEG (not PDF)',
  'Auto-resized <500KB',
  'Free for GPs',
] as const;

export function ReferralImagesHomeCard() {
  const { userId, isLoaded } = useAuth();

  return (
    <div className="group relative rounded-lg border border-slate-200 bg-white p-5 transition-shadow hover:shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-[#1A1A1A]">Referral Images</h2>
        <span className="text-sm font-medium text-[#6B6B6B]">Live • Free for GPs</span>
      </div>

      <p className="text-sm text-[#1A1A1A] leading-relaxed mb-4">
        Stop wasting 30 minutes per referral.
        <br />
        Phone to desktop in 30 seconds. No more email-to-self, manual resize, or &quot;file too large&quot; rejections. Always JPEG (not PDF).
        <br />
        Free for GPs.
      </p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
        {BULLETS.map((label) => (
          <li key={label} className="flex items-center gap-2 text-sm text-[#1A1A1A]">
            <CheckCircle className="h-5 w-5 shrink-0 text-[#2D7A5F]" aria-hidden />
            <span>{label}</span>
          </li>
        ))}
      </ul>

      <Button
        asChild
        variant="outline"
        className="w-full border-[#2D7A5F] text-[#2D7A5F] hover:bg-[#2D7A5F]/10 hover:scale-[1.02] transition-all"
      >
        <Link href="/referral-images" className="inline-flex items-center justify-center">
          {isLoaded && userId ? 'Open' : 'Start Free'}
          <ChevronRight className="ml-2 h-5 w-5" aria-hidden />
        </Link>
      </Button>
    </div>
  );
}
