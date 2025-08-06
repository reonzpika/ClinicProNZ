'use client'

import React from 'react'
import { QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/src/lib/react-query'

interface QueryClientProviderProps {
  children: React.ReactNode
}

export function QueryClientProvider({ children }: QueryClientProviderProps) {
  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
      {/* Only show DevTools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </TanStackQueryClientProvider>
  )
}