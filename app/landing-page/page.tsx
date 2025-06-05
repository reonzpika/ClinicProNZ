import { ClinicalDecisionSection } from '@/pages/landing-page/components/ClinicalDecisionSection';
import { CustomTemplatesSection } from '@/pages/landing-page/components/CustomTemplatesSection';
import { FinalCTASection } from '@/pages/landing-page/components/FinalCTASection';
import { FounderSection } from '@/pages/landing-page/components/FounderSection';
import { HeroSection } from '@/pages/landing-page/components/HeroSection';
import { PainPointsSection } from '@/pages/landing-page/components/PainPointsSection';
import { PricingSection } from '@/pages/landing-page/components/PricingSection';
import { ProductSection } from '@/pages/landing-page/components/ProductSection';
import { SolutionSection } from '@/pages/landing-page/components/SolutionSection';
import { Footer } from '@/shared/components/Footer';
import { Header } from '@/shared/components/Header';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <PainPointsSection />
      <SolutionSection />
      <ProductSection />
      <CustomTemplatesSection />
      <ClinicalDecisionSection />
      <FounderSection />
      <PricingSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
