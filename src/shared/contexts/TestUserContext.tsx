'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type TestUserContextType = {
  // Original admin email before switching to test user
  originalAdminEmail: string | null;
  // Set when user switches to test user
  setOriginalAdminEmail: (email: string) => void;
  // Clear when back to admin
  clearOriginalAdminEmail: () => void;
  // Check if currently in test user mode
  isTestUserMode: boolean;
};

const TestUserContext = createContext<TestUserContextType | undefined>(undefined);

export function TestUserProvider({ children }: { children: ReactNode }) {
  const [originalAdminEmail, setOriginalAdminEmailState] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('clinicpro-test-mode-admin-email');
    if (stored) {
      setOriginalAdminEmailState(stored);
    }
  }, []);

  const setOriginalAdminEmail = (email: string) => {
    setOriginalAdminEmailState(email);
    localStorage.setItem('clinicpro-test-mode-admin-email', email);
  };

  const clearOriginalAdminEmail = () => {
    setOriginalAdminEmailState(null);
    localStorage.removeItem('clinicpro-test-mode-admin-email');
  };

  const value = useMemo(() => ({
    originalAdminEmail,
    setOriginalAdminEmail,
    clearOriginalAdminEmail,
    isTestUserMode: originalAdminEmail !== null,
  }), [originalAdminEmail, setOriginalAdminEmail, clearOriginalAdminEmail]);

  return (
    <TestUserContext.Provider value={value}>
      {children}
    </TestUserContext.Provider>
  );
}

export function useTestUser() {
  const context = useContext(TestUserContext);
  if (context === undefined) {
    throw new Error('useTestUser must be used within a TestUserProvider');
  }
  return context;
}
