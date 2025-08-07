import { useCallback, useEffect } from 'react'
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
import { useSessionAccess } from '@/src/hooks/useSessionAccess'
import type { PatientSession } from '@/src/types/consultation'

/**
 * Custom hook that provides the same interface as the original ConsultationContext
 * but uses Zustand stores underneath. This allows for gradual migration.
 */
export function useConsultationStores(): any {
  const { isSignedIn } = useAuth()
  const { hasSessionHistoryAccess } = useSessionAccess()
  
  // Zustand stores
  const transcriptionStore = useTranscriptionStore()
  const consultationStore = useConsultationStore()
  const mobileStore = useMobileStore()
  
  // React Query hooks for server state - fetch sessions for users with session history access
  const { data: patientSessions = [] } = usePatientSessions(hasSessionHistoryAccess)
  
  // Auto-load session data when page loads with a persisted session ID
  useEffect(() => {
    const currentSessionId = consultationStore.currentPatientSessionId
    
    // Only auto-load if we have a session ID, sessions are loaded, and we haven't loaded data yet
    if (currentSessionId && Array.isArray(patientSessions) && patientSessions.length > 0) {
      const session = patientSessions.find((s: any) => s.id === currentSessionId)
      
      // Only auto-load if the session exists and we don't have transcription data yet
      if (session && !transcriptionStore.transcription.transcript && !transcriptionStore.typedInput) {
        console.log('Auto-loading session data for:', currentSessionId)
        
        // Use the same loading logic as switchToPatientSession but without calling onSwitch
        if (session.transcriptions) {
          try {
            const transcriptions = typeof session.transcriptions === 'string' 
              ? JSON.parse(session.transcriptions) 
              : session.transcriptions
            
            if (Array.isArray(transcriptions) && transcriptions.length > 0) {
              const latestTranscription = transcriptions[transcriptions.length - 1]
              transcriptionStore.setTranscription(
                latestTranscription.text || '',
                false,
                undefined,
                undefined
              )
            }
          } catch (error) {
            console.error('Error auto-loading transcriptions:', error)
          }
        }
        
        if (session.typedInput) {
          transcriptionStore.setTypedInput(session.typedInput)
        }
        
        if (session.notes) {
          consultationStore.setGeneratedNotes(session.notes)
        }
        
        if (session.consultationNotes) {
          consultationStore.setConsultationNotes(session.consultationNotes)
        }
        
        if (session.templateId) {
          consultationStore.setTemplateId(session.templateId)
        }
      }
    }
  }, [consultationStore.currentPatientSessionId, patientSessions, transcriptionStore.transcription.transcript, transcriptionStore.typedInput])
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
    // Return existing session ID if we have one in the store
    if (consultationStore.currentPatientSessionId) {
      return consultationStore.currentPatientSessionId
    }
    
    // Create a new session
    try {
      const result = await createSessionMutation.mutateAsync({ patientName: 'Quick Consultation' })
      // Set the current session ID in the store
      consultationStore.setCurrentPatientSessionId(result.id)
      
      // Broadcast session change to mobile devices via Ably
      if (typeof window !== 'undefined' && (window as any).ablySyncHook?.updateSession) {
        (window as any).ablySyncHook.updateSession(result.id, result.patientName)
      }
      
      return result.id
    } catch (error) {
      console.error('Failed to create session:', error)
      return null
    }
  }, [consultationStore.currentPatientSessionId, consultationStore.setCurrentPatientSessionId, createSessionMutation])
  
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
      
      // Set as current session and broadcast to mobile devices
      consultationStore.setCurrentPatientSessionId(result.id)
      
      // Broadcast session change to mobile devices via Ably
      if (typeof window !== 'undefined' && (window as any).ablySyncHook?.updateSession) {
        (window as any).ablySyncHook.updateSession(result.id, result.patientName)
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
      await updatePatientSession(currentSessionId, { notes: notes })
      return true
    } catch (error) {
      return false
    }
  }, [consultationStore.currentPatientSessionId, updatePatientSession])
  
  const saveTypedInputToCurrentSession = useCallback(async (typedInput: string): Promise<boolean> => {
    const currentSessionId = consultationStore.currentPatientSessionId
    if (!currentSessionId) return false
    
    try {
      await updatePatientSession(currentSessionId, { typedInput })
      return true
    } catch (error) {
      console.error('Failed to save typed input to session:', error)
      return false
    }
  }, [consultationStore.currentPatientSessionId, updatePatientSession])
  
  const saveConsultationNotesToCurrentSession = useCallback(async (consultationNotes: string): Promise<boolean> => {
    const currentSessionId = consultationStore.currentPatientSessionId
    if (!currentSessionId) return false
    
    try {
      await updatePatientSession(currentSessionId, { consultationNotes: consultationNotes })
      return true
    } catch (error) {
      console.error('Failed to save consultation notes to session:', error)
      return false
    }
  }, [consultationStore.currentPatientSessionId, updatePatientSession])
  
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
  
  const saveTranscriptionsToCurrentSession = useCallback(async (): Promise<boolean> => {
    const currentSessionId = consultationStore.currentPatientSessionId
    if (!currentSessionId) return false
    
    try {
      // Get current transcription data from store
      const transcriptionData = transcriptionStore.transcription
      
      // Create transcription entries array (convert current state to session format)
      const transcriptions = transcriptionData.transcript ? [{
        id: Date.now().toString(),
        text: transcriptionData.transcript,
        timestamp: new Date().toISOString(),
        source: 'desktop' as const,
        deviceId: 'browser'
      }] : []
      
      await updatePatientSession(currentSessionId, { transcriptions })
      return true
    } catch (error) {
      console.error('Failed to save transcriptions to session:', error)
      return false
    }
  }, [consultationStore.currentPatientSessionId, transcriptionStore.transcription, updatePatientSession])
  
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
    saveTranscriptionsToCurrentSession,
    
    // Placeholder functions that might be needed
    loadPatientSessions: async () => {
      // This is handled automatically by React Query
    },
    getCurrentPatientSession: () => {
      // For users without session-history permission, just return a basic session object
      if (!Array.isArray(patientSessions) || patientSessions.length === 0) {
        return consultationStore.currentPatientSessionId ? {
          id: consultationStore.currentPatientSessionId,
          patientName: 'Current Session',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } : null
      }
      return patientSessions.find((s: any) => s.id === consultationStore.currentPatientSessionId) || null
    },
    switchToPatientSession: (sessionId: string, onSwitch?: (sessionId: string, patientName: string) => void) => {
      // Always allow switching to a session by ID, even if we don't have the full sessions list
      consultationStore.setCurrentPatientSessionId(sessionId)
      
      // Try to find session details if available
      const session = Array.isArray(patientSessions) ? patientSessions.find((s: any) => s.id === sessionId) : null
      const patientName = session?.patientName || 'Current Session'
      
      // Load session data into stores if session is found
      if (session) {
        // Load transcriptions into transcription store
        if (session.transcriptions) {
          try {
            const transcriptions = typeof session.transcriptions === 'string' 
              ? JSON.parse(session.transcriptions) 
              : session.transcriptions
            
            if (Array.isArray(transcriptions) && transcriptions.length > 0) {
              // Convert to the format expected by transcription store
              const latestTranscription = transcriptions[transcriptions.length - 1]
              transcriptionStore.setTranscription(
                latestTranscription.text || '',
                false, // isLive = false for loaded data
                undefined, // diarizedTranscript
                undefined // utterances
              )
            }
          } catch (error) {
            console.error('Error loading transcriptions:', error)
          }
        }
        
        // Load typed input into transcription store
        if (session.typedInput) {
          transcriptionStore.setTypedInput(session.typedInput)
        }
        
        // Load generated notes into consultation store
        if (session.notes) {
          consultationStore.setGeneratedNotes(session.notes)
        }
        
        // Load consultation notes into consultation store
        if (session.consultationNotes) {
          consultationStore.setConsultationNotes(session.consultationNotes)
        }
        
        // Load template ID if available
        if (session.templateId) {
          consultationStore.setTemplateId(session.templateId)
        }
        
        // Load consultation items if available
        if (session.consultationItems) {
          try {
            const items = typeof session.consultationItems === 'string' 
              ? JSON.parse(session.consultationItems) 
              : session.consultationItems
            
            if (Array.isArray(items)) {
              // Clear existing consultation items first
              const currentItems = consultationStore.consultationItems
              currentItems.forEach((item: any) => {
                consultationStore.removeConsultationItem(item.id)
              })
              
              // Load new consultation items
              items.forEach((item: any) => {
                consultationStore.addConsultationItem({
                  type: item.type || 'other',
                  title: item.title || '',
                  content: item.content || ''
                })
              })
            }
          } catch (error) {
            console.error('Error loading consultation items:', error)
          }
        }
        
        // Load clinical images if available
        if (session.clinicalImages) {
          try {
            const images = typeof session.clinicalImages === 'string' 
              ? JSON.parse(session.clinicalImages) 
              : session.clinicalImages
            
            if (Array.isArray(images)) {
              // Clear existing clinical images first
              const currentImages = consultationStore.clinicalImages
              currentImages.forEach((image: any) => {
                consultationStore.removeClinicalImage(image.id)
              })
              
              // Load new clinical images
              images.forEach((image: any) => {
                consultationStore.addClinicalImage(image)
              })
            }
          } catch (error) {
            console.error('Error loading clinical images:', error)
          }
        }
      }
      
      onSwitch?.(sessionId, patientName)
    },
    completePatientSession: async (_sessionId: string) => {
      // Implementation would depend on what "complete" means
    },
  }
}