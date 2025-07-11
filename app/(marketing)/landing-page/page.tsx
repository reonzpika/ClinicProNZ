import { ClinicalDecisionSection } from '@/src/shared/components/landing-page/ClinicalDecisionSection';
import { CustomTemplatesSection } from '@/src/shared/components/landing-page/CustomTemplatesSection';
import { FinalCTASection } from '@/src/shared/components/landing-page/FinalCTASection';
import { FounderSection } from '@/src/shared/components/landing-page/FounderSection';
import { HeroSection } from '@/src/shared/components/landing-page/HeroSection';
import { PainPointsSection } from '@/src/shared/components/landing-page/PainPointsSection';
import { ProductSection } from '@/src/shared/components/landing-page/ProductSection';
import { SolutionSection } from '@/src/shared/components/landing-page/SolutionSection';
import { TestimonialsSection } from '@/src/shared/components/landing-page/TestimonialsSection';

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <PainPointsSection />
      <SolutionSection />
      <ProductSection />
      <TestimonialsSection />
      <CustomTemplatesSection />
      <ClinicalDecisionSection />
      <FounderSection />
      <FinalCTASection />
    </main>
  );
}
