import { QueryClient } from '@tanstack/react-query';

// Create QueryClient with optimized defaults for consultation app
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes - consultation data changes moderately
      staleTime: 5 * 60 * 1000,
      // Cache time: 10 minutes - keep data in cache for offline access
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      // Refetch on window focus for critical consultation data
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect to avoid excessive API calls
      refetchOnReconnect: false,
      // Enable background updates for better UX
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations once in case of network issues
      retry: 1,
      // Enable mutation networking for better error handling
      networkMode: 'online',
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Consultation related queries
  consultation: {
    all: ['consultation'] as const,
    sessions: () => [...queryKeys.consultation.all, 'sessions'] as const,
    session: (id: string) => [...queryKeys.consultation.sessions(), id] as const,
    notes: (sessionId: string) => [...queryKeys.consultation.session(sessionId), 'notes'] as const,
    chat: (sessionId: string) => [...queryKeys.consultation.session(sessionId), 'chat'] as const,
  },
  // Template related queries
  templates: {
    all: ['templates'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.templates.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.templates.all, 'detail', id] as const,
  },
  // Usage and analytics
  usage: {
    all: ['usage'] as const,
    dashboard: () => [...queryKeys.usage.all, 'dashboard'] as const,
  },
} as const;
