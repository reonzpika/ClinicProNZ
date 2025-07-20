import type { Metadata } from 'next';

import { EarlyFooterCTA } from '@/src/shared/components/early-landing/EarlyFooterCTA';
import { EarlyHeroSection } from '@/src/shared/components/early-landing/EarlyHeroSection';
import { EarlyPricingSection } from '@/src/shared/components/early-landing/EarlyPricingSection';
import { FutureIntegrationsSection } from '@/src/shared/components/early-landing/FutureIntegrationsSection';
import { HowItWorksSection } from '@/src/shared/components/early-landing/HowItWorksSection';
import { PersonalStorySection } from '@/src/shared/components/early-landing/PersonalStorySection';

export const metadata: Metadata = {
  title: 'ClinicPro Early Access - Turn Consults into Notes in Seconds',
  description: 'Join the first 15 NZ GPs at NZ$30/month. Desktop SaaS with phone recording - no apps, no microphone setup. Built by a practicing GP who understands the struggle.',
  keywords: 'AI medical scribe, New Zealand GP, consultation notes, early access, medical documentation, healthcare AI, general practice, burnout solution',
  openGraph: {
    title: 'ClinicPro Early Access - Turn Consults into Notes in Seconds',
    description: 'Join the first 15 NZ GPs at NZ$30/month. Desktop SaaS with phone recording - built by a practicing GP.',
    type: 'website',
    locale: 'en_NZ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClinicPro Early Access - Turn Consults into Notes in Seconds',
    description: 'Join the first 15 NZ GPs at NZ$30/month. Built by a practicing GP who understands the struggle.',
  },
};

export default function EarlyAccessPage() {
  return (
    <main>
      <EarlyHeroSection />
      <PersonalStorySection />
      <HowItWorksSection />
      <EarlyPricingSection />
      <FutureIntegrationsSection />
      <EarlyFooterCTA />
    </main>
  );
}
