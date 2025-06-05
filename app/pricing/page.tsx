import { Footer } from '@/shared/components/Footer';
import { Header } from '@/shared/components/Header';

import { PricingCTA } from '../../src/pages/pricing/components/PricingCTA';
import { PricingFAQ } from '../../src/pages/pricing/components/PricingFAQ';
import { PricingHero } from '../../src/pages/pricing/components/PricingHero';
import { PricingPlans } from '../../src/pages/pricing/components/PricingPlans';

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <PricingHero />
      <PricingPlans />
      <PricingFAQ />
      <PricingCTA />
      <Footer />
    </div>
  );
}
