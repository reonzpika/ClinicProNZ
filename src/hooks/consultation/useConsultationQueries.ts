import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { queryKeys } from '@/src/lib/react-query'
import { consultationApi, type ConsultationChatRequest, type ConsultationNotesRequest } from '@/src/lib/api/consultation'
import type { PatientSession } from '@/src/types/consultation'
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata'
import { useConsultationStore } from '@/src/stores/consultationStore'

// Hook for consultation chat
export function useConsultationChat() {
  const { userId } = useAuth()
  const { getUserTier } = useClerkMetadata()
  const getEffectiveGuestToken = useConsultationStore(state => state.getEffectiveGuestToken)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: ConsultationChatRequest) =>
      consultationApi.chat(request, userId, getUserTier(), getEffectiveGuestToken()),
    onSuccess: () => {
      // Invalidate any related queries if needed
      queryClient.invalidateQueries({ queryKey: queryKeys.consultation.all })
    },
    onError: (error) => {
      console.error('Consultation chat error:', error)
    },
  })
}

// Hook for generating consultation notes
export function useGenerateConsultationNotes() {
  const { userId } = useAuth()
  const { getUserTier } = useClerkMetadata()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: ConsultationNotesRequest) =>
      consultationApi.generateNotes(request, userId, getUserTier()),
    onSuccess: () => {
      // Invalidate sessions list to reflect potential changes
      queryClient.invalidateQueries({ queryKey: queryKeys.consultation.sessions() })
    },
    onError: (error) => {
      console.error('Generate consultation notes error:', error)
    },
  })
}

// Hook for patient sessions list
export function usePatientSessions(enabled: boolean = false): any {
  const { userId } = useAuth()
  const { getUserTier } = useClerkMetadata()
  const getEffectiveGuestToken = useConsultationStore(state => state.getEffectiveGuestToken)

  return useQuery({
    queryKey: queryKeys.consultation.sessions(),
    queryFn: () => consultationApi.getSessions(userId, getUserTier(), getEffectiveGuestToken()),
    enabled: enabled && (!!userId || !!getEffectiveGuestToken()), // Only fetch when explicitly enabled AND we have auth
    staleTime: 2 * 60 * 1000, // 2 minutes - sessions don't change very often
  })
}

// Hook for a specific patient session
export function usePatientSession(sessionId: string | null) {
  const { userId } = useAuth()
  const { getUserTier } = useClerkMetadata()
  const getEffectiveGuestToken = useConsultationStore(state => state.getEffectiveGuestToken)
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: queryKeys.consultation.session(sessionId || ''),
    queryFn: async () => {
      // Try to get from sessions list first
      const sessions = queryClient.getQueryData<PatientSession[]>(queryKeys.consultation.sessions())
      const session = sessions?.find(s => s.id === sessionId)
      if (session) return session

      // If not in cache, we would need an API endpoint to fetch single session
      // For now, refetch all sessions
      const allSessions = await consultationApi.getSessions(userId, getUserTier(), getEffectiveGuestToken())
      return allSessions.find(s => s.id === sessionId) || null
    },
    enabled: !!sessionId && (!!userId || !!getEffectiveGuestToken()),
  })
}

// Hook for creating a new patient session
export function useCreatePatientSession(): any {
  const { userId } = useAuth()
  const { getUserTier } = useClerkMetadata()
  const getEffectiveGuestToken = useConsultationStore(state => state.getEffectiveGuestToken)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ patientName, templateId }: { patientName: string; templateId?: string }) =>
      consultationApi.createSession(patientName, userId, getUserTier(), getEffectiveGuestToken(), templateId),
    onSuccess: (newSession) => {
      // Add to sessions cache
      queryClient.setQueryData<PatientSession[]>(
        queryKeys.consultation.sessions(),
        (oldSessions = []) => [newSession, ...oldSessions]
      )
      // Set individual session cache
      queryClient.setQueryData(queryKeys.consultation.session(newSession.id), newSession)
    },
    onError: (error) => {
      console.error('Create patient session error:', error)
    },
  })
}

// Hook for updating a patient session
export function useUpdatePatientSession(): any {
  const { userId } = useAuth()
  const { getUserTier } = useClerkMetadata()
  const getEffectiveGuestToken = useConsultationStore(state => state.getEffectiveGuestToken)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      sessionId, 
      updates 
    }: { 
      sessionId: string
      updates: Partial<Pick<PatientSession, 'patientName' | 'consultationNotes'>>
    }) =>
      consultationApi.updateSession(sessionId, updates, userId, getUserTier(), getEffectiveGuestToken()),
    onSuccess: (updatedSession) => {
      // Update sessions list cache
      queryClient.setQueryData<PatientSession[]>(
        queryKeys.consultation.sessions(),
        (oldSessions = []) =>
          oldSessions.map(session =>
            session.id === updatedSession.id ? updatedSession : session
          )
      )
      // Update individual session cache
      queryClient.setQueryData(queryKeys.consultation.session(updatedSession.id), updatedSession)
    },
    onError: (error) => {
      console.error('Update patient session error:', error)
    },
  })
}

// Hook for deleting a patient session
export function useDeletePatientSession(): any {
  const { userId } = useAuth()
  const { getUserTier } = useClerkMetadata()
  const getEffectiveGuestToken = useConsultationStore(state => state.getEffectiveGuestToken)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: string) =>
      consultationApi.deleteSession(sessionId, userId, getUserTier(), getEffectiveGuestToken()),
    onSuccess: (_, sessionId) => {
      // Remove from sessions list cache
      queryClient.setQueryData<PatientSession[]>(
        queryKeys.consultation.sessions(),
        (oldSessions = []) => oldSessions.filter(session => session.id !== sessionId)
      )
      // Remove individual session cache
      queryClient.removeQueries({ queryKey: queryKeys.consultation.session(sessionId) })
    },
    onError: (error) => {
      console.error('Delete patient session error:', error)
    },
  })
}

// Hook for deleting all patient sessions
export function useDeleteAllPatientSessions(): any {
  const { userId } = useAuth()
  const { getUserTier } = useClerkMetadata()
  const getEffectiveGuestToken = useConsultationStore(state => state.getEffectiveGuestToken)
  const setCurrentPatientSessionId = useConsultationStore(state => state.setCurrentPatientSessionId)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      consultationApi.deleteAllSessions(userId, getUserTier(), getEffectiveGuestToken()),
    onSuccess: () => {
      // Clear all session-related caches
      queryClient.removeQueries({ queryKey: queryKeys.consultation.all })
      // Clear the current session ID since all sessions are deleted
      setCurrentPatientSessionId(null)
    },
    onError: (error) => {
      console.error('Delete all patient sessions error:', error)
    },
  })
}