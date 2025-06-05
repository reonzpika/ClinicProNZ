import { ClinicalDecisionSection } from '@/shared/components/landing-page/ClinicalDecisionSection';
import { CustomTemplatesSection } from '@/shared/components/landing-page/CustomTemplatesSection';
import { FinalCTASection } from '@/shared/components/landing-page/FinalCTASection';
import { FounderSection } from '@/shared/components/landing-page/FounderSection';
import { HeroSection } from '@/shared/components/landing-page/HeroSection';
import { PainPointsSection } from '@/shared/components/landing-page/PainPointsSection';
import { PricingSection } from '@/shared/components/landing-page/PricingSection';
import { ProductSection } from '@/shared/components/landing-page/ProductSection';
import { SolutionSection } from '@/shared/components/landing-page/SolutionSection';

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <PainPointsSection />
      <SolutionSection />
      <ProductSection />
      <CustomTemplatesSection />
      <ClinicalDecisionSection />
      <FounderSection />
      <PricingSection />
      <FinalCTASection />
    </main>
  );
}
