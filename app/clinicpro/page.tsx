import type { Metadata } from 'next';

import { EarlyAdoptersSection } from '@/shared/components/clinicpro-landing/EarlyAdoptersSection';
import { FAQSection } from '@/shared/components/clinicpro-landing/FAQSection';
import { FooterSection } from '@/shared/components/clinicpro-landing/FooterSection';
import { ClinicProHeroSection } from '@/shared/components/clinicpro-landing/HeroSection';
import { PricingSection } from '@/shared/components/clinicpro-landing/PricingSection';
import { ScreenshotGallery } from '@/shared/components/clinicpro-landing/ScreenshotGallery';
import { WhatDeliversSection } from '@/shared/components/clinicpro-landing/WhatDeliversSection';

export const metadata: Metadata = {
  title: 'ClinicPro - Finish Your Consultation Notes in Under 1 Minute',
  description: 'AI-powered medical scribing built specifically for New Zealand GPs. Cut admin time, stop working afterhours. Join the first 30 GPs at NZ$30/month.',
  keywords: 'AI medical scribe, New Zealand GP, consultation notes, medical documentation, healthcare AI, general practice',
  openGraph: {
    title: 'ClinicPro - Finish Your Consultation Notes in Under 1 Minute',
    description: 'AI-powered medical scribing built specifically for New Zealand GPs. Cut admin time, stop working afterhours.',
    type: 'website',
    locale: 'en_NZ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClinicPro - Finish Your Consultation Notes in Under 1 Minute',
    description: 'AI-powered medical scribing built specifically for New Zealand GPs.',
  },
};

export default function ClinicProLandingPage() {
  return (
    <main>
      <ClinicProHeroSection />
      <WhatDeliversSection />
      <ScreenshotGallery />
      <EarlyAdoptersSection />
      <PricingSection />
      <FAQSection />
      <FooterSection />
    </main>
  );
}
