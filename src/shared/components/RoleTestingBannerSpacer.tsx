'use client';

import { useRoleTesting } from '@/src/shared/contexts/RoleTestingContext';

type RoleTestingBannerSpacerProps = {
  children: React.ReactNode;
};

export function RoleTestingBannerSpacer({ children }: RoleTestingBannerSpacerProps) {
  const { isTestingRole } = useRoleTesting();

  return (
    <div className={isTestingRole ? 'pt-12' : ''}>
      {children}
    </div>
  );
}
