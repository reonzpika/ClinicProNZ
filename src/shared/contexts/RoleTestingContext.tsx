'use client';

import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

import type { UserTier } from '@/src/shared/utils/roles';

type TierTestingContextType = {
  testingTier: UserTier | null;
  isTestingTier: boolean;
  originalTier: UserTier | null;
  startTierTesting: (tier: UserTier, originalTier: UserTier) => void;
  stopTierTesting: () => void;
};

const TierTestingContext = createContext<TierTestingContextType | undefined>(undefined);

export function TierTestingProvider({ children }: { children: ReactNode }) {
  const [testingTier, setTestingTier] = useState<UserTier | null>(null);
  const [originalTier, setOriginalTier] = useState<UserTier | null>(null);

  const startTierTesting = (tier: UserTier, original: UserTier) => {
    setTestingTier(tier);
    setOriginalTier(original);
  };

  const stopTierTesting = () => {
    setTestingTier(null);
    setOriginalTier(null);
  };

  const contextValue = useMemo(() => ({
    testingTier,
    isTestingTier: testingTier !== null,
    originalTier,
    startTierTesting,
    stopTierTesting,
  }), [testingTier, originalTier, startTierTesting, stopTierTesting]);

  return (
    <TierTestingContext.Provider value={contextValue}>
      {children}
    </TierTestingContext.Provider>
  );
}

export function useTierTestingContext() {
  const context = useContext(TierTestingContext);
  if (context === undefined) {
    throw new Error('useTierTestingContext must be used within a TierTestingProvider');
  }
  return context;
}

/**
 * Hook to get effective tier (testing tier if active, otherwise actual tier)
 */
export function useEffectiveTier(actualTier: UserTier): UserTier {
  const { testingTier } = useTierTestingContext();
  return testingTier || actualTier;
}

// Export old names for backward compatibility
export const RoleTestingContext = TierTestingContext;
export const RoleTestingProvider = TierTestingProvider;
export const useRoleTestingContext = useTierTestingContext;
export const useRoleTesting = useTierTestingContext;
export const useEffectiveRole = useEffectiveTier;
