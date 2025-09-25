/**
 * Hook for fetching cost tracking data
 */

import { useQuery } from '@tanstack/react-query';

export type CostSummary = {
  totalCost: number;
  totalUsers: number;
  totalSessions: number;
  totalRequests: number;
  byProvider: {
    deepgram: number;
    openai: number;
    perplexity: number;
  };
  byFunction: {
    transcription: number;
    note_generation: number;
    chat: number;
  };
};

export type UserCostSummary = {
  userId: string;
  email: string;
  totalCost: number;
  sessionCount: number;
  requestCount: number;
  byProvider: {
    deepgram: number;
    openai: number;
    perplexity: number;
  };
  byFunction: {
    transcription: number;
    note_generation: number;
    chat: number;
  };
};

export type SessionCostDetail = {
  sessionId: string;
  patientName: string;
  totalCost: number;
  requestCount: number;
  createdAt: string;
  byProvider: {
    deepgram: number;
    openai: number;
    perplexity: number;
  };
  byFunction: {
    transcription: number;
    note_generation: number;
    chat: number;
  };
};

// Query keys
export const costTrackingQueryKeys = {
  summary: () => ['cost-tracking', 'summary'] as const,
  userSummaries: () => ['cost-tracking', 'user-summaries'] as const,
  sessionDetails: (userId?: string) => ['cost-tracking', 'session-details', userId] as const,
};

/**
 * Fetch overall cost summary
 */
export function useCostSummary() {
  return useQuery({
    queryKey: costTrackingQueryKeys.summary(),
    queryFn: async (): Promise<CostSummary> => {
      const response = await fetch('/api/admin/cost-tracking/summary');
      if (!response.ok) {
        throw new Error('Failed to fetch cost summary');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch user cost summaries
 */
export function useUserCostSummaries() {
  return useQuery({
    queryKey: costTrackingQueryKeys.userSummaries(),
    queryFn: async (): Promise<UserCostSummary[]> => {
      const response = await fetch('/api/admin/cost-tracking/users');
      if (!response.ok) {
        throw new Error('Failed to fetch user cost summaries');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch session cost details for a specific user
 */
export function useSessionCostDetails(userId?: string) {
  return useQuery({
    queryKey: costTrackingQueryKeys.sessionDetails(userId),
    queryFn: async (): Promise<SessionCostDetail[]> => {
      const url = userId
        ? `/api/admin/cost-tracking/sessions?userId=${userId}`
        : '/api/admin/cost-tracking/sessions';

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch session cost details');
      }
      return response.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
