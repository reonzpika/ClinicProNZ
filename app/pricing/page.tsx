import { PricingCTA } from '@/shared/components/pricing/PricingCTA';
import { PricingFAQ } from '@/shared/components/pricing/PricingFAQ';
import { PricingHero } from '@/shared/components/pricing/PricingHero';
import { PricingPlans } from '@/shared/components/pricing/PricingPlans';

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
