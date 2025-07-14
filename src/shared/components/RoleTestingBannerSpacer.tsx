'use client';

import type { ReactNode } from 'react';

import { useTierTestingContext } from '@/src/shared/contexts/RoleTestingContext';

type TierTestingBannerSpacerProps = {
  children: ReactNode;
};

export function RoleTestingBannerSpacer({ children }: TierTestingBannerSpacerProps) {
  return <TierTestingBannerSpacer>{children}</TierTestingBannerSpacer>;
}

export function TierTestingBannerSpacer({ children }: TierTestingBannerSpacerProps) {
  const { isTestingTier } = useTierTestingContext();

  return (
    <div className={isTestingTier ? 'pt-12' : ''}>
      {children}
    </div>
  );
}
