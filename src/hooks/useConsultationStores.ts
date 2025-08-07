import { useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useTranscriptionStore } from '@/src/stores/transcriptionStore'
import { useConsultationStore } from '@/src/stores/consultationStore'
import { useMobileStore } from '@/src/stores/mobileStore'
import { 
  usePatientSessions,
  useCreatePatientSession,
  useUpdatePatientSession,
  useDeletePatientSession,
  useDeleteAllPatientSessions
} from '@/src/hooks/consultation/useConsultationQueries'
import type { PatientSession } from '@/src/types/consultation'

/**
 * Custom hook that provides the same interface as the original ConsultationContext
 * but uses Zustand stores underneath. This allows for gradual migration.
 */
export function useConsultationStores(): any {
  const { isSignedIn } = useAuth()
  
  // Zustand stores
  const transcriptionStore = useTranscriptionStore()
  const consultationStore = useConsultationStore()
  const mobileStore = useMobileStore()
  
  // React Query hooks for server state - only fetch sessions when explicitly needed
  const { data: patientSessions = [] } = usePatientSessions(false)
  const createSessionMutation = useCreatePatientSession()
  const updateSessionMutation = useUpdatePatientSession()
  const deleteSessionMutation = useDeletePatientSession()
  const deleteAllSessionsMutation = useDeleteAllPatientSessions()
  
  // Initialize guest token if needed
  const initializeGuestToken = useCallback(() => {
    if (!isSignedIn && !consultationStore.guestToken) {
      if (typeof window !== 'undefined') {
        const existingToken = localStorage.getItem('guestToken')
        if (existingToken) {
          consultationStore.setGuestToken(existingToken)
        } else {
          const newToken = crypto.randomUUID()
          localStorage.setItem('guestToken', newToken)
          consultationStore.setGuestToken(newToken)
        }
      }
    }
  }, [isSignedIn, consultationStore])
  
  // Initialize on first use
  if (!isSignedIn && !consultationStore.guestToken) {
    initializeGuestToken()
  }
  
  // Patient session helpers
  const ensureActiveSession = useCallback(async (): Promise<string | null> => {
    // Return existing session if we have one and it exists in the server data
    const currentSession = Array.isArray(patientSessions) ? patientSessions.find((s: any) => s.id === consultationStore.currentPatientSessionId) : null
    if (currentSession) {
      return currentSession.id
    }
    
    // Create a new session
    try {
      const result = await createSessionMutation.mutateAsync({ patientName: 'Quick Consultation' })
      return result.id
    } catch (error) {
      console.error('Failed to create session:', error)
      return null
    }
  }, [patientSessions, consultationStore.currentPatientSessionId, createSessionMutation])
  
  const createPatientSession = useCallback(async (
    patientName: string,
    templateId?: string
  ): Promise<PatientSession | null> => {
    try {
      const result = await createSessionMutation.mutateAsync({ patientName, templateId })
      // Template is already set during creation
      if (templateId) {
        consultationStore.setTemplateId(templateId)
      }
      return result
    } catch (error) {
      console.error('Failed to create patient session:', error)
      return null
    }
  }, [createSessionMutation, consultationStore])
  
  const updatePatientSession = useCallback(async (
    sessionId: string,
    updates: Partial<PatientSession>
  ): Promise<void> => {
    try {
      await updateSessionMutation.mutateAsync({ sessionId, updates })
    } catch (error) {
      console.error('Failed to update patient session:', error)
      throw error
    }
  }, [updateSessionMutation])
  
  const deletePatientSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      await deleteSessionMutation.mutateAsync(sessionId)
      return true
    } catch (error) {
      console.error('Failed to delete patient session:', error)
      return false
    }
  }, [deleteSessionMutation])
  
  const deleteAllPatientSessions = useCallback(async (): Promise<boolean> => {
    try {
      await deleteAllSessionsMutation.mutateAsync()
      return true
    } catch (error) {
      console.error('Failed to delete all patient sessions:', error)
      return false
    }
  }, [deleteAllSessionsMutation])
  
  const saveNotesToCurrentSession = useCallback(async (notes: string): Promise<boolean> => {
    const currentSessionId = consultationStore.currentPatientSessionId
    if (!currentSessionId) return false
    
    try {
      await updatePatientSession(currentSessionId, { consultationNotes: notes })
      return true
    } catch (error) {
      return false
    }
  }, [consultationStore.currentPatientSessionId, updatePatientSession])
  
  const saveTypedInputToCurrentSession = useCallback(async (_typedInput: string): Promise<boolean> => {
    // This could be extended to save typed input to session if needed
    return true
  }, [])
  
  const saveConsultationNotesToCurrentSession = useCallback(async (consultationNotes: string): Promise<boolean> => {
    return saveNotesToCurrentSession(consultationNotes)
  }, [saveNotesToCurrentSession])
  
  const saveClinicalImagesToCurrentSession = useCallback(async (clinicalImages: any[]): Promise<boolean> => {
    const currentSessionId = consultationStore.currentPatientSessionId
    if (!currentSessionId) return false
    
    try {
      await updatePatientSession(currentSessionId, { clinicalImages })
      return true
    } catch (error) {
      return false
    }
  }, [consultationStore.currentPatientSessionId, updatePatientSession])
  
  // Return combined interface that matches the original ConsultationContext
  return {
    // Session and template state
    sessionId: consultationStore.sessionId,
    templateId: consultationStore.templateId,
    status: consultationStore.status,
    currentPatientSessionId: consultationStore.currentPatientSessionId,
    
    // Input and transcription state
    inputMode: transcriptionStore.inputMode,
    transcription: transcriptionStore.transcription,
    typedInput: transcriptionStore.typedInput,
    
    // Generated content
    generatedNotes: consultationStore.generatedNotes,
    error: consultationStore.error,
    
    // Settings and preferences
    userDefaultTemplateId: consultationStore.userDefaultTemplateId,
    consentObtained: transcriptionStore.consentObtained,
    microphoneGain: transcriptionStore.microphoneGain,
    volumeThreshold: transcriptionStore.volumeThreshold,
    settings: consultationStore.settings,
    
    // Chat state
    chatHistory: consultationStore.chatHistory,
    isChatContextEnabled: consultationStore.isChatContextEnabled,
    isChatLoading: consultationStore.isChatLoading,
    
    // Consultation data
    consultationItems: consultationStore.consultationItems,
    consultationNotes: consultationStore.consultationNotes,
    
    // Patient sessions (from React Query)
    patientSessions,
    
    // Guest token
    guestToken: consultationStore.guestToken,
    
    // Mobile state
    mobileV2: mobileStore.mobileV2,
    
    // Last generated tracking
    lastGeneratedTranscription: transcriptionStore.lastGeneratedTranscription,
    lastGeneratedTypedInput: transcriptionStore.lastGeneratedTypedInput,
    lastGeneratedCompiledConsultationText: transcriptionStore.lastGeneratedCompiledConsultationText,
    lastGeneratedTemplateId: transcriptionStore.lastGeneratedTemplateId,
    
    // Actions - Session and template
    setStatus: consultationStore.setStatus,
    setTemplateId: consultationStore.setTemplateId,
    
    // Actions - Input and transcription
    setInputMode: transcriptionStore.setInputMode,
    setTranscription: transcriptionStore.setTranscription,
    setTranscriptionEnhanced: transcriptionStore.setTranscriptionEnhanced,
    appendTranscription: transcriptionStore.appendTranscription,
    appendTranscriptionEnhanced: transcriptionStore.appendTranscriptionEnhanced,
    setTypedInput: transcriptionStore.setTypedInput,
    
    // Actions - Generated content
    setGeneratedNotes: consultationStore.setGeneratedNotes,
    setError: consultationStore.setError,
    
    // Actions - Settings
    setUserDefaultTemplateId: consultationStore.setUserDefaultTemplateId,
    setConsentObtained: transcriptionStore.setConsentObtained,
    setMicrophoneGain: transcriptionStore.setMicrophoneGain,
    setVolumeThreshold: transcriptionStore.setVolumeThreshold,
    
    // Actions - Chat
    addChatMessage: consultationStore.addChatMessage,
    clearChatHistory: consultationStore.clearChatHistory,
    setChatContextEnabled: consultationStore.setChatContextEnabled,
    setChatLoading: consultationStore.setChatLoading,
    
    // Actions - Consultation data
    addConsultationItem: consultationStore.addConsultationItem,
    removeConsultationItem: consultationStore.removeConsultationItem,
    setConsultationNotes: consultationStore.setConsultationNotes,
    getCompiledConsultationText: consultationStore.getCompiledConsultationText,
    
    // Actions - Guest token
    setGuestToken: consultationStore.setGuestToken,
    getEffectiveGuestToken: consultationStore.getEffectiveGuestToken,
    
    // Actions - Mobile
    enableMobileV2: mobileStore.enableMobileV2,
    setMobileV2Token: mobileStore.setMobileV2Token,
    setMobileV2TokenData: mobileStore.setMobileV2TokenData,
    setMobileV2ConnectionStatus: mobileStore.setMobileV2ConnectionStatus,
    setMobileV2SessionSynced: mobileStore.setMobileV2SessionSynced,
    
    // Actions - Last generated tracking
    setLastGeneratedInput: transcriptionStore.setLastGeneratedInput,
    resetLastGeneratedInput: transcriptionStore.resetLastGeneratedInput,
    
    // Utility functions
    getCurrentTranscript: transcriptionStore.getCurrentTranscript,
    getCurrentInput: transcriptionStore.getCurrentInput,
    
    // Patient session functions
    ensureActiveSession,
    createPatientSession,
    updatePatientSession,
    deletePatientSession,
    deleteAllPatientSessions,
    saveNotesToCurrentSession,
    saveTypedInputToCurrentSession,
    saveConsultationNotesToCurrentSession,
    
    // Reset functions
    resetConsultation: () => {
      transcriptionStore.resetTranscription()
      consultationStore.resetConsultation()
      mobileStore.resetMobileState()
    },
    
    // Clinical images
    addClinicalImage: consultationStore.addClinicalImage,
    removeClinicalImage: consultationStore.removeClinicalImage,
    updateImageDescription: consultationStore.updateImageDescription,
    saveClinicalImagesToCurrentSession,
    
    // Placeholder functions that might be needed
    loadPatientSessions: async () => {
      // This is handled automatically by React Query
    },
    getCurrentPatientSession: () => {
      return Array.isArray(patientSessions) ? patientSessions.find((s: any) => s.id === consultationStore.currentPatientSessionId) || null : null
    },
    switchToPatientSession: (sessionId: string, onSwitch?: (sessionId: string, patientName: string) => void) => {
      const session = Array.isArray(patientSessions) ? patientSessions.find((s: any) => s.id === sessionId) : null
      if (session) {
        consultationStore.setCurrentPatientSessionId(sessionId)
        onSwitch?.(sessionId, session.patientName)
      }
    },
    completePatientSession: async (_sessionId: string) => {
      // Implementation would depend on what "complete" means
    },
  }
}