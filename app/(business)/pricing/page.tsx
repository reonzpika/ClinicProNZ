import { PricingCTA } from '@/src/shared/components/pricing/PricingCTA';
import { PricingFAQ } from '@/src/shared/components/pricing/PricingFAQ';
import { PricingHero } from '@/src/shared/components/pricing/PricingHero';
import { PricingPlans } from '@/src/shared/components/pricing/PricingPlans';

export default function PricingPage() {
  return (
    <main>
      <PricingHero />
      <PricingPlans />
      <PricingFAQ />
      <PricingCTA />
    </main>
  );
}
