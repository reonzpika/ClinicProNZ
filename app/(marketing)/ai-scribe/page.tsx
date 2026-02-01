import type { Metadata } from 'next';

import { EarlyFooterCTA } from '@/src/shared/components/early-landing/EarlyFooterCTA';
import { EarlyHeroSection } from '@/src/shared/components/early-landing/EarlyHeroSection';
import { FeatureAiscribe } from '@/src/shared/components/early-landing/FeatureAiscribe';
import { FeatureChat } from '@/src/shared/components/early-landing/FeatureChat';
import { FeatureImage } from '@/src/shared/components/early-landing/FeatureImage';
import { MissionSection } from '@/src/shared/components/early-landing/MissionSection';
import { PageFooter } from '@/src/shared/components/early-landing/PageFooter';
import { PageNavigation } from '@/src/shared/components/early-landing/PageNavigation';
import { PersonalStorySection } from '@/src/shared/components/early-landing/PersonalStorySection';

export const metadata: Metadata = {
  title: 'ClinicPro - AI Medical Scribing for NZ GPs',
  description:
    'Finish on time. Capture the consult; get a clean draft note fast. AI scribe for NZ GPs — faster notes, less cognitive load, consistent structure. Built by a practicing GP.',
  keywords:
    'AI medical scribe, New Zealand GP, clinical notes, medical automation, healthcare efficiency, general practice, GP scribe, consultation notes',
  openGraph: {
    title: 'ClinicPro - AI Medical Scribing for NZ GPs',
    description:
      'AI scribe for NZ GPs: capture the consult, get structured notes fast. Built by a practicing GP.',
    type: 'website',
    locale: 'en_NZ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClinicPro - AI Medical Scribing for NZ GPs',
    description:
      'Finish on time. Capture the consult; get a clean draft note fast. Built by a practicing GP.',
  },
};

export default function AiScribeLandingPage() {
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
        <div id="mission">
          <MissionSection />
        </div>
        <div id="ai-scribe">
          <FeatureAiscribe />
        </div>
        <div id="feature-image">
          <FeatureImage />
        </div>
        <div id="feature-chat">
          <FeatureChat />
        </div>

        <div id="start">
          <EarlyFooterCTA />
        </div>
      </main>
      <PageFooter />
    </>
  );
}
