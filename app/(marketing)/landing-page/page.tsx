import type { Metadata } from 'next';

import { EarlyFooterCTA } from '@/src/shared/components/early-landing/EarlyFooterCTA';
import { EarlyHeroSection } from '@/src/shared/components/early-landing/EarlyHeroSection';
import { EarlyPricingSection } from '@/src/shared/components/early-landing/EarlyPricingSection';
import { FutureIntegrationsSection } from '@/src/shared/components/early-landing/FutureIntegrationsSection';
import { HowItWorksSection } from '@/src/shared/components/early-landing/HowItWorksSection';
import { PageFooter } from '@/src/shared/components/early-landing/PageFooter';
import { PageNavigation } from '@/src/shared/components/early-landing/PageNavigation';
import { PersonalStorySection } from '@/src/shared/components/early-landing/PersonalStorySection';
import { AiScribe } from '@/src/shared/components/early-landing/AiScribe';

export const metadata: Metadata = {
  title: 'ClinicPro - Get More Done in 15 Minutes and Leave on Time, Satisfied',
  description: 'Smart tools that help NZ GPs manage 15-minute consults, reduce admin, and leave work on time. Built by a practicing GP who understands the struggle.',
  keywords: 'AI medical scribe, New Zealand GP, 15-minute consults, early access, medical automation, healthcare efficiency, general practice, work-life balance, GP burnout solution',
  openGraph: {
    title: 'ClinicPro - Get More Done in 15 Minutes and Leave on Time, Satisfied',
    description: 'ClinicPro brings the latest smart tools to your practice — happier patients, smoother admin, and more time for what matters.',
    type: 'website',
    locale: 'en_NZ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClinicPro - Get More Done in 15 Minutes and Leave on Time, Satisfied',
    description: 'Smart tools that help NZ GPs manage 15-minute consults, reduce admin, and leave work on time.',
  },
};

export default function EarlyAccessPage() {
  return (
    <>
      <PageNavigation />
      <main>
        <div id="hero">
          <EarlyHeroSection />
        </div>
        <div id="story">
          <PersonalStorySection />
        </div>
        <div id="ai-scribe">
          <AiScribe />
        </div>
        <div id="problems">
          <HowItWorksSection />
        </div>
        <div id="vision">
          <EarlyPricingSection />
        </div>
        <div id="features">
          <FutureIntegrationsSection />
        </div>
        <div id="start">
          <EarlyFooterCTA />
        </div>
      </main>
      <PageFooter />
    </>
  );
}
