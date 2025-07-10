'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useMemo } from 'react';

import type { UserRole } from '@/shared/utils/roles';

type RoleTestingContextType = {
  // Current role being tested (null = using real role)
  testingRole: UserRole | null;
  // Original role (always preserved)
  originalRole: UserRole | null;
  // Start testing a specific role
  startRoleTesting: (role: UserRole, originalRole: UserRole) => void;
  // Stop testing and revert to original role
  stopRoleTesting: () => void;
  // Check if currently testing a role
  isTestingRole: boolean;
};

const RoleTestingContext = createContext<RoleTestingContextType | undefined>(undefined);

export function RoleTestingProvider({ children }: { children: ReactNode }) {
  const [testingRole, setTestingRole] = useState<UserRole | null>(null);
  const [originalRole, setOriginalRole] = useState<UserRole | null>(null);

  const startRoleTesting = (role: UserRole, original: UserRole) => {
    setTestingRole(role);
    setOriginalRole(original);
  };

  const stopRoleTesting = () => {
    setTestingRole(null);
    setOriginalRole(null);
  };

  const value = useMemo(() => ({
    testingRole,
    originalRole,
    startRoleTesting,
    stopRoleTesting,
    isTestingRole: testingRole !== null,
  }), [testingRole, originalRole, startRoleTesting, stopRoleTesting]);

  return (
    <RoleTestingContext.Provider value={value}>
      {children}
    </RoleTestingContext.Provider>
  );
}

export function useRoleTesting() {
  const context = useContext(RoleTestingContext);
  if (context === undefined) {
    throw new Error('useRoleTesting must be used within a RoleTestingProvider');
  }
  return context;
}

export function useEffectiveRole(actualRole: UserRole): UserRole {
  const { testingRole } = useRoleTesting();
  return testingRole || actualRole;
}
