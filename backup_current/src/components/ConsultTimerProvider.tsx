'use client';

import type { ReactNode } from 'react';

import { ConsultTimerContext, useCreateConsultTimer } from '@/hooks/useConsultTimer';

export function ConsultTimerProvider({ children }: { children: ReactNode }) {
  const timer = useCreateConsultTimer();

  return (
    <ConsultTimerContext.Provider value={timer}>
      {children}
    </ConsultTimerContext.Provider>
  );
}
