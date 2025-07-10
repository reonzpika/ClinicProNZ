'use client';

import { Check, Crown, Star } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { getPlanByRole } from '@/shared/utils/billing-config';
import type { UserRole } from '@/shared/utils/roles';

type PlanCardProps = {
  role: UserRole;
  currentUserRole: UserRole;
  onUpgrade?: (role: UserRole) => void;
  className?: string;
};

export function PlanCard({ role, currentUserRole, onUpgrade, className = '' }: PlanCardProps) {
  const plan = getPlanByRole(role);

  if (!plan) {
    return null;
  }

  const isCurrentPlan = currentUserRole === role;
  const canUpgrade = role === 'standard' && (currentUserRole === 'signed_up' || currentUserRole === 'public');

  const getIcon = () => {
    switch (role) {
      case 'signed_up':
        return <Star className="size-6 text-blue-600" />;
      case 'standard':
        return <Crown className="size-6 text-green-600" />;
      case 'admin':
        return <Star className="size-6 text-purple-600" />;
      default:
        return null;
    }
  };

  const getBorderStyle = () => {
    if (isCurrentPlan) {
      return 'border-green-500 bg-green-50';
    }
    if (role === 'standard') {
      return 'border-blue-500';
    }
    return 'border-gray-200';
  };

  return (
    <div className={`relative rounded-lg border-2 p-6 ${getBorderStyle()} ${className}`}>
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-white">
            Current Plan
          </span>
        </div>
      )}

      {role === 'standard' && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-blue-500 px-3 py-1 text-sm font-medium text-white">
            Recommended
          </span>
        </div>
      )}

      <div className="text-center">
        <div className="mb-4 flex items-center justify-center">
          {getIcon()}
          <h3 className="ml-2 text-xl font-bold text-gray-900">{plan.name}</h3>
        </div>

        <div className="mb-6">
          <div className="text-4xl font-bold text-gray-900">
            {plan.price === 0 ? 'Free' : `$${plan.price}`}
            {plan.price > 0 && <span className="text-lg font-normal text-gray-600">/month</span>}
          </div>
        </div>

        <ul className="mb-8 space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="mr-3 size-4 text-green-500" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        {isCurrentPlan
          ? (
              <Button disabled className="w-full">
                Current Plan
              </Button>
            )
          : canUpgrade
            ? (
                <Button
                  onClick={() => onUpgrade?.(role)}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                >
                  Upgrade to
                  {' '}
                  {plan.name}
                </Button>
              )
            : role === 'admin'
              ? (
                  <Button disabled className="w-full">
                    Admin Only
                  </Button>
                )
              : (
                  <Button disabled className="w-full">
                    {currentUserRole === 'standard' ? 'Your Plan' : 'Not Available'}
                  </Button>
                )}
      </div>
    </div>
  );
}
