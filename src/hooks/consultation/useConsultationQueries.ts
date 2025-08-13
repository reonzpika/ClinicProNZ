import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { consultationApi, type ConsultationChatRequest, type ConsultationNotesRequest } from '@/src/lib/api/consultation';
import { createAuthHeaders } from '@/src/shared/utils';
import { queryKeys } from '@/src/lib/react-query';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { useConsultationStore } from '@/src/stores/consultationStore';
import type { PatientSession } from '@/src/types/consultation';

// Hook for consultation chat
export function useConsultationChat() {
  const { userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ConsultationChatRequest) =>
      consultationApi.chat(request, userId, getUserTier()),
    onSuccess: () => {
      // Invalidate any related queries if needed
      queryClient.invalidateQueries({ queryKey: queryKeys.consultation.all });
    },
    onError: (_error: unknown) => {
      // noop
    },
  });
}

// Hook for generating consultation notes
export function useGenerateConsultationNotes() {
  const { userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ConsultationNotesRequest) =>
      consultationApi.generateNotes(request, userId, getUserTier()),
    onSuccess: () => {
      // Invalidate sessions list to reflect potential changes
      queryClient.invalidateQueries({ queryKey: queryKeys.consultation.sessions() });
    },
    onError: (_error: unknown) => {
      // noop
    },
  });
}

// Hook for patient sessions list
export function usePatientSessions(enabled: boolean = false): any {
  const { userId } = useAuth();
  const { getUserTier } = useClerkMetadata();

  return useQuery({
    queryKey: queryKeys.consultation.sessions(),
    queryFn: () => consultationApi.getSessions(userId, getUserTier()),
    enabled: enabled && !!userId, // Only fetch when explicitly enabled AND user is authenticated
    staleTime: 2 * 60 * 1000, // 2 minutes - sessions don't change very often
  });
}

// Hook for a specific patient session
export function usePatientSession(sessionId: string | null) {
  const { userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.consultation.session(sessionId || ''),
    queryFn: async () => {
      // Try to get from sessions list first
      const sessions = queryClient.getQueryData<PatientSession[]>(queryKeys.consultation.sessions());
      const session = sessions?.find((s: PatientSession) => s.id === sessionId);
      if (session) {
        return session;
      }

      // If not in cache, refetch all sessions
      const allSessions = await consultationApi.getSessions(userId, getUserTier());
      return allSessions.find((s: PatientSession) => s.id === sessionId) || null;
    },
    enabled: !!sessionId && !!userId,
  });
}

// Hook for creating a new patient session
export function useCreatePatientSession(): any {
  const { userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientName, templateId }: { patientName: string; templateId?: string }) =>
      consultationApi.createSession(patientName, userId, getUserTier(), templateId),
    onSuccess: (newSession: PatientSession) => {
      // Add to sessions cache
      queryClient.setQueryData<PatientSession[]>(
        queryKeys.consultation.sessions(),
        (oldSessions?: PatientSession[]) => [newSession, ...(oldSessions ?? [])],
      );
      // Set individual session cache
      queryClient.setQueryData(queryKeys.consultation.session(newSession.id), newSession);
    },
    onError: (_error: unknown) => {
      // noop
    },
  });
}

// Hook for updating a patient session
export function useUpdatePatientSession(): any {
  const { userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      updates,
    }: {
      sessionId: string;
      updates: Partial<Pick<PatientSession, 'patientName' | 'consultationNotes'>>;
    }) =>
      consultationApi.updateSession(sessionId, updates, userId, getUserTier()),
    onSuccess: (updatedSession: PatientSession) => {
      // Update sessions list cache
      queryClient.setQueryData<PatientSession[]>(
        queryKeys.consultation.sessions(),
        (oldSessions?: PatientSession[]) =>
          (oldSessions ?? []).map((session: PatientSession) =>
            session.id === updatedSession.id ? updatedSession : session,
          ),
      );
      // Update individual session cache
      queryClient.setQueryData(queryKeys.consultation.session(updatedSession.id), updatedSession);
    },
    onError: (_error: unknown) => {
      // noop
    },
  });
}

// Hook for deleting a patient session
export function useDeletePatientSession(): any {
  const { userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const queryClient = useQueryClient();
  const setCurrentPatientSessionId = useConsultationStore(state => state.setCurrentPatientSessionId);

  return useMutation({
    mutationFn: (sessionId: string) =>
      consultationApi.deleteSession(sessionId, userId, getUserTier()),
    onSuccess: (res: any, sessionId: string) => {
      // Remove from sessions list cache
      queryClient.setQueryData<PatientSession[]>(
        queryKeys.consultation.sessions(),
        (oldSessions?: PatientSession[]) => (oldSessions ?? []).filter((session: PatientSession) => session.id !== sessionId),
      );
      // Remove individual session cache
      queryClient.removeQueries({ queryKey: queryKeys.consultation.session(sessionId) });

      // Update current session id if server decided a new one
      if (res && res.currentSessionId) {
        try {
          setCurrentPatientSessionId(res.currentSessionId);
          // Best-effort: persist to server (server already set it but OK to be redundant)
          fetch('/api/current-session', { method: 'PUT', headers: { 'Content-Type': 'application/json', ...createAuthHeaders(userId, getUserTier()) }, body: JSON.stringify({ sessionId: res.currentSessionId }) }).catch(() => {});
          // Best-effort: broadcast
          if (typeof window !== 'undefined' && (window as any).ablySyncHook?.updateSession) {
            (window as any).ablySyncHook.updateSession(res.currentSessionId, 'Current Session');
          }
          // Ensure the sessions list refreshes immediately so modals/UI have the new session
          queryClient.invalidateQueries({ queryKey: queryKeys.consultation.sessions() }).catch(() => {});
        } catch {}
      }
    },
    onError: (_error: unknown) => {
      // noop
    },
  });
}

// Hook for deleting all patient sessions
export function useDeleteAllPatientSessions(): any {
  const { userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const setCurrentPatientSessionId = useConsultationStore(state => state.setCurrentPatientSessionId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      consultationApi.deleteAllSessions(userId, getUserTier()),
    onSuccess: (res: any) => {
      // Clear all session-related caches
      queryClient.removeQueries({ queryKey: queryKeys.consultation.all });
      // Server guarantees a new session; set it client-side
      if (res && res.currentSessionId) {
        setCurrentPatientSessionId(res.currentSessionId);
        try {
          // Best-effort broadcast and persist
          fetch('/api/current-session', { method: 'PUT', headers: { 'Content-Type': 'application/json', ...createAuthHeaders(userId, getUserTier()) }, body: JSON.stringify({ sessionId: res.currentSessionId }) }).catch(() => {});
          if (typeof window !== 'undefined' && (window as any).ablySyncHook?.updateSession) {
            (window as any).ablySyncHook.updateSession(res.currentSessionId, 'Current Session');
          }
          // Refresh sessions immediately
          queryClient.invalidateQueries({ queryKey: queryKeys.consultation.sessions() }).catch(() => {});
        } catch {}
      }
    },
    onError: (_error: unknown) => {
      // noop
    },
  });
}
