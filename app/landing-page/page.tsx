import { ClinicalDecisionSection } from '@/shared/components/landing-page/ClinicalDecisionSection';
import { CustomTemplatesSection } from '@/shared/components/landing-page/CustomTemplatesSection';
import { FinalCTASection } from '@/shared/components/landing-page/FinalCTASection';
import { FounderSection } from '@/shared/components/landing-page/FounderSection';
import { HeroSection } from '@/shared/components/landing-page/HeroSection';
import { PainPointsSection } from '@/shared/components/landing-page/PainPointsSection';
import { ProductSection } from '@/shared/components/landing-page/ProductSection';
import { SolutionSection } from '@/shared/components/landing-page/SolutionSection';
import { TestimonialsSection } from '@/shared/components/landing-page/TestimonialsSection';

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
