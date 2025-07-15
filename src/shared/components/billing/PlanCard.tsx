'use client';

import { Badge } from '@/src/shared/components/ui/badge';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { cn } from '@/src/shared/utils';
import { getPlanByTier } from '@/src/shared/utils/billing-config';
import type { UserTier } from '@/src/shared/utils/roles';

type PlanCardProps = {
  planTier: UserTier;
  currentUserTier: UserTier;
  onUpgrade?: (planTier: UserTier) => void;
  className?: string;
};

export function PlanCard({ planTier, currentUserTier, onUpgrade, className = '' }: PlanCardProps) {
  const plan = getPlanByTier(planTier);

  if (!plan) {
    return null;
  }

  const isCurrentPlan = currentUserTier === planTier;
  const canUpgrade = planTier === 'standard' && (currentUserTier === 'basic');
  const canUpgradeToPremium = planTier === 'premium' && (currentUserTier === 'basic' || currentUserTier === 'standard');

  return (
    <Card className={cn('relative h-full', className)}>
      {isCurrentPlan && (
        <div className="absolute -top-2 left-1/2 z-10 -translate-x-1/2">
          <Badge className="bg-green-600">Current Plan</Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          {plan.price > 0 && (
            <div className="text-right">
              <span className="text-2xl font-bold">
                $
                {plan.price}
              </span>
              <span className="text-sm text-gray-500">/month</span>
            </div>
          )}
          {plan.price === 0 && (
            <div className="text-right">
              <span className="text-2xl font-bold">Free</span>
            </div>
          )}
        </div>
        <CardDescription>
          Perfect for
          {' '}
          {planTier === 'basic'
            ? 'getting started'
            : planTier === 'standard'
              ? 'regular use'
              : planTier === 'premium' ? 'power users' : 'administrators'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="space-y-2 text-sm">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <span className="mr-2 text-green-500">✓</span>
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-6">
          {isCurrentPlan
            ? (
                <Button disabled className="w-full" variant="outline">
                  {currentUserTier === 'standard' ? 'Your Plan' : 'Current Plan'}
                </Button>
              )
            : (canUpgrade || canUpgradeToPremium) && onUpgrade
                ? (
                    <Button
                      onClick={() => onUpgrade(planTier)}
                      className="w-full"
                      variant={planTier === 'premium' ? 'default' : 'outline'}
                    >
                      Upgrade to
                      {' '}
                      {plan.name}
                    </Button>
                  )
                : (
                    <Button disabled className="w-full" variant="outline">
                      {planTier === 'admin' ? 'Contact Admin' : 'Not Available'}
                    </Button>
                  )}
        </div>
      </CardContent>
    </Card>
  );
}
