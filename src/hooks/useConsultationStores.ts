import { useAuth } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect } from 'react';

import {
  useCreatePatientSession,
  useDeleteAllPatientSessions,
  useDeletePatientSession,
  usePatientSessions,
  useUpdatePatientSession,
} from '@/src/hooks/consultation/useConsultationQueries';
import { useSessionAccess } from '@/src/hooks/useSessionAccess';
import { createAuthHeaders } from '@/src/shared/utils';
import { useConsultationStore } from '@/src/stores/consultationStore';
import { useMobileStore } from '@/src/stores/mobileStore';
import { useTranscriptionStore } from '@/src/stores/transcriptionStore';
import type { PatientSession } from '@/src/types/consultation';

// Facade hook used across the clinical UI. Provides a stable API over Zustand + TanStack state.
export function useConsultationStores(): any {
  const { isSignedIn: _isSignedIn, userId } = useAuth();
  const { hasSessionHistoryAccess } = useSessionAccess();

  const pathname = usePathname();

  // Zustand stores
  const transcriptionStore = useTranscriptionStore();
  const consultationStore = useConsultationStore();
  const mobileStore = useMobileStore();

  // Server state via React Query - disable on mobile routes
  const isMobileRoute = pathname === '/mobile';
  const { data: patientSessions = [] } = usePatientSessions(hasSessionHistoryAccess && !isMobileRoute);

  // Hydrate local state when a persisted session is present but local is empty
  useEffect(() => {
    const currentSessionId = consultationStore.currentPatientSessionId;
    if (!currentSessionId || !Array.isArray(patientSessions) || patientSessions.length === 0) {
 return;
}
    const session = patientSessions.find((s: any) => s.id === currentSessionId);
    if (!session) {
 return;
}

    // Suppress hydration for a brief window immediately after a Clear All
    try {
      if (typeof window !== 'undefined') {
        const until = (window as any).__clinicproJustClearedUntil as number | undefined;
        if (typeof until === 'number' && Date.now() < until) {
          return;
        }
      }
    } catch {}

    const hasLocal = !!(transcriptionStore.transcription.transcript || transcriptionStore.typedInput);
    // Only treat as remote content if non-empty values are present
    let remoteTrans: any[] = [];
    try {
      if (session.transcriptions) {
        remoteTrans = typeof session.transcriptions === 'string'
          ? JSON.parse(session.transcriptions)
          : session.transcriptions;
      }
    } catch {
      remoteTrans = [];
    }
    const hasRemoteTrans = Array.isArray(remoteTrans) && remoteTrans.length > 0;
    const hasRemoteTextFields = !!(session.typedInput && String(session.typedInput).trim())
      || !!(session.notes && String(session.notes).trim())
      || !!(session.consultationNotes && String(session.consultationNotes).trim());
    const hasRemote = hasRemoteTrans || hasRemoteTextFields;

    // If we already have local data or remote is empty, ensure local transcript is cleared and exit
    if (hasLocal || !hasRemote) {
      if (!hasRemote && transcriptionStore.transcription.transcript) {
        transcriptionStore.setTranscription('', false);
      }
      return;
    }

    try {
      if (hasRemoteTrans) {
        const latest = remoteTrans[remoteTrans.length - 1];
        transcriptionStore.setTranscription((latest?.text || '').trim(), false, undefined, undefined);
      }
    } catch {
      // ignore JSON errors
    }
    if (session.typedInput) {
 transcriptionStore.setTypedInput(session.typedInput);
}
    if (session.notes) {
 consultationStore.setGeneratedNotes(session.notes);
}
    if (session.consultationNotes) {
 consultationStore.setConsultationNotes(session.consultationNotes);
}
    if (session.templateId) {
 consultationStore.setTemplateId(session.templateId);
}
  }, [consultationStore, consultationStore.currentPatientSessionId, patientSessions, transcriptionStore, transcriptionStore.transcription.transcript, transcriptionStore.typedInput]);

  // Mutations
  const createSessionMutation = useCreatePatientSession();
  const updateSessionMutation = useUpdatePatientSession();
  const deleteSessionMutation = useDeletePatientSession();
  const deleteAllSessionsMutation = useDeleteAllPatientSessions();

  const ensureActiveSession = useCallback(async (): Promise<string | null> => {
    if (consultationStore.currentPatientSessionId) {
 return consultationStore.currentPatientSessionId;
}
    try {
      // Simple patient name - date/time info stored in session table
      const patientName = 'Patient';

      const result = await createSessionMutation.mutateAsync({ patientName });
      consultationStore.setCurrentPatientSessionId(result.id);
      return result.id;
    } catch {
      return null;
    }
  }, [consultationStore, createSessionMutation]);

  const createPatientSession = useCallback(async (patientName: string, templateId?: string): Promise<PatientSession | null> => {
    try {
      const result = await createSessionMutation.mutateAsync({ patientName, templateId });
      if (templateId) {
 consultationStore.setTemplateId(templateId);
}
      consultationStore.setCurrentPatientSessionId(result.id);
      return result;
    } catch {
      return null;
    }
  }, [createSessionMutation, consultationStore]);

  const updatePatientSession = useCallback(async (sessionId: string, updates: Partial<PatientSession>): Promise<void> => {
    await updateSessionMutation.mutateAsync({ sessionId, updates });
  }, [updateSessionMutation]);

  const deletePatientSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      await deleteSessionMutation.mutateAsync(sessionId);
      return true;
    } catch {
      return false;
    }
  }, [deleteSessionMutation]);

  const deleteAllPatientSessions = useCallback(async (): Promise<boolean> => {
    try {
      await deleteAllSessionsMutation.mutateAsync();
      return true;
    } catch {
      return false;
    }
  }, [deleteAllSessionsMutation]);

  const saveNotesToCurrentSession = useCallback(async (notes: string): Promise<boolean> => {
    const id = consultationStore.currentPatientSessionId;
    if (!id) {
      return false;
    }
    await updatePatientSession(id, { notes } as any);
    return true;
  }, [consultationStore.currentPatientSessionId, updatePatientSession]);

  const saveTypedInputToCurrentSession = useCallback(async (typedInput: string): Promise<boolean> => {
    const id = consultationStore.currentPatientSessionId;
    if (!id) {
      return false;
    }
    await updatePatientSession(id, { typedInput } as any);
    return true;
  }, [consultationStore.currentPatientSessionId, updatePatientSession]);

  const saveConsultationNotesToCurrentSession = useCallback(async (consultationNotes: string): Promise<boolean> => {
    const id = consultationStore.currentPatientSessionId;
    if (!id) {
      return false;
    }
    await updatePatientSession(id, { consultationNotes } as any);
    return true;
  }, [consultationStore.currentPatientSessionId, updatePatientSession]);

  const saveClinicalImagesToCurrentSession = useCallback(async (clinicalImages: any[]): Promise<boolean> => {
    const id = consultationStore.currentPatientSessionId;
    if (!id) {
      return false;
    }
    await updatePatientSession(id, { clinicalImages } as any);
    return true;
  }, [consultationStore.currentPatientSessionId, updatePatientSession]);

  const saveTranscriptionsToCurrentSession = useCallback(async (): Promise<boolean> => {
    const id = consultationStore.currentPatientSessionId;
    if (!id) {
      return false;
    }
    try {
      const t = transcriptionStore.transcription;
      const transcriptions = t.transcript ? [{ id: Date.now().toString(), text: t.transcript, timestamp: new Date().toISOString(), source: 'desktop' as const, deviceId: 'browser' }] : [];
      await updatePatientSession(id, { transcriptions } as any);
      return true;
    } catch {
      return false;
    }
  }, [consultationStore.currentPatientSessionId, transcriptionStore.transcription, updatePatientSession]);

  return {
    // Session and template state
    sessionId: consultationStore.sessionId,
    templateId: consultationStore.templateId,
    status: consultationStore.status,
    currentPatientSessionId: consultationStore.currentPatientSessionId,

    // Inputs
    inputMode: transcriptionStore.inputMode,
    transcription: transcriptionStore.transcription,
    typedInput: transcriptionStore.typedInput,

    // Generated content
    generatedNotes: consultationStore.generatedNotes,
    error: consultationStore.error,

    // Settings
    userDefaultTemplateId: consultationStore.userDefaultTemplateId,
    consentObtained: transcriptionStore.consentObtained,
    microphoneGain: transcriptionStore.microphoneGain,
    volumeThreshold: transcriptionStore.volumeThreshold,
    settings: consultationStore.settings,

    // Chat
    chatHistory: consultationStore.chatHistory,
    isChatContextEnabled: consultationStore.isChatContextEnabled,
    isChatLoading: consultationStore.isChatLoading,

    // Consultation data
    consultationItems: consultationStore.consultationItems,
    consultationNotes: consultationStore.consultationNotes,

    // Sessions list
    patientSessions,

    // Mobile state
    mobileV2: mobileStore.mobileV2,

    // Last generated tracking
    lastGeneratedTranscription: transcriptionStore.lastGeneratedTranscription,
    lastGeneratedTypedInput: transcriptionStore.lastGeneratedTypedInput,
    lastGeneratedCompiledConsultationText: transcriptionStore.lastGeneratedCompiledConsultationText,
    lastGeneratedTemplateId: transcriptionStore.lastGeneratedTemplateId,

    // Actions - session/template
    setStatus: consultationStore.setStatus,
    setTemplateId: consultationStore.setTemplateId,

    // Actions - input/transcription
    setInputMode: transcriptionStore.setInputMode,
    setTranscription: transcriptionStore.setTranscription,
    setTranscriptionEnhanced: transcriptionStore.setTranscriptionEnhanced,
    appendTranscription: useCallback(async (newTranscript: string, isLive: boolean, source: 'desktop' | 'mobile' = 'desktop', deviceId?: string, diarizedTranscript?: string, utterances?: any[]) => {
      await transcriptionStore.appendTranscription(newTranscript, isLive, source, deviceId, diarizedTranscript, utterances);
      const id = consultationStore.currentPatientSessionId;
      if (!id || !newTranscript.trim()) {
        return;
      }
      try {
        const entry = { id: Math.random().toString(36).substr(2, 9), text: newTranscript.trim(), timestamp: new Date().toISOString(), source, deviceId };
        const current = Array.isArray(patientSessions) ? patientSessions.find((s: any) => s.id === id) : null;
        const updated = [...(current?.transcriptions || []), entry];
        await updatePatientSession(id, { transcriptions: updated } as any);
      } catch {}
    }, [transcriptionStore, consultationStore.currentPatientSessionId, patientSessions, updatePatientSession]),
    appendTranscriptionEnhanced: useCallback(async (newTranscript: string, isLive: boolean, source: 'desktop' | 'mobile' = 'desktop', deviceId?: string, diarizedTranscript?: string, utterances?: any[], confidence?: number, words?: any[], paragraphs?: any) => {
      await transcriptionStore.appendTranscriptionEnhanced(newTranscript, isLive, source, deviceId, diarizedTranscript, utterances, confidence, words, paragraphs);
      const id = consultationStore.currentPatientSessionId;
      if (!id || !newTranscript.trim()) {
        return;
      }
      try {
        const entry = { id: Math.random().toString(36).substr(2, 9), text: newTranscript.trim(), timestamp: new Date().toISOString(), source, deviceId };
        const current = Array.isArray(patientSessions) ? patientSessions.find((s: any) => s.id === id) : null;
        const updated = [...(current?.transcriptions || []), entry];
        await updatePatientSession(id, { transcriptions: updated } as any);
      } catch {}
    }, [transcriptionStore, consultationStore.currentPatientSessionId, patientSessions, updatePatientSession]),
    setTypedInput: transcriptionStore.setTypedInput,

    // Actions - generated content
    setGeneratedNotes: consultationStore.setGeneratedNotes,
    setError: consultationStore.setError,

    // Actions - settings & chat
    setUserDefaultTemplateId: consultationStore.setUserDefaultTemplateId,
    setConsentObtained: transcriptionStore.setConsentObtained,
    setMicrophoneGain: transcriptionStore.setMicrophoneGain,
    setVolumeThreshold: transcriptionStore.setVolumeThreshold,
    addChatMessage: consultationStore.addChatMessage,
    clearChatHistory: consultationStore.clearChatHistory,
    setChatContextEnabled: consultationStore.setChatContextEnabled,
    setChatLoading: consultationStore.setChatLoading,

    // Actions - consultation data
    addConsultationItem: consultationStore.addConsultationItem,
    removeConsultationItem: consultationStore.removeConsultationItem,
    setConsultationNotes: consultationStore.setConsultationNotes,
    getCompiledConsultationText: consultationStore.getCompiledConsultationText,

    // Actions - mobile
    enableMobileV2: mobileStore.enableMobileV2,
    setMobileV2Token: mobileStore.setMobileV2Token,
    setMobileV2TokenData: mobileStore.setMobileV2TokenData,
    setMobileV2IsConnected: mobileStore.setMobileV2IsConnected,

    // Actions - last generated tracking
    setLastGeneratedInput: transcriptionStore.setLastGeneratedInput,
    resetLastGeneratedInput: transcriptionStore.resetLastGeneratedInput,

    // Utilities
    getCurrentTranscript: transcriptionStore.getCurrentTranscript,
    getCurrentInput: transcriptionStore.getCurrentInput,

    // Patient session helpers
    ensureActiveSession,
    createPatientSession,
    updatePatientSession,
    deletePatientSession,
    deleteAllPatientSessions,
    saveNotesToCurrentSession,
    saveTypedInputToCurrentSession,
    saveConsultationNotesToCurrentSession,

    // Reset
    resetConsultation: () => {
      // UI-only reset: preserve mobile connection/token across session changes
      transcriptionStore.resetTranscription();
      consultationStore.resetConsultation();
    },

    // Reset only transcription (do not touch consultation state)
    resetTranscription: () => {
      transcriptionStore.resetTranscription();
    },

    // Clinical images
    addClinicalImage: consultationStore.addClinicalImage,
    removeClinicalImage: consultationStore.removeClinicalImage,
    updateImageDescription: consultationStore.updateImageDescription,
    saveClinicalImagesToCurrentSession,
    saveTranscriptionsToCurrentSession,

    // Session accessors
    loadPatientSessions: async () => {},
    getCurrentPatientSession: () => {
      if (!Array.isArray(patientSessions) || patientSessions.length === 0) {
        return consultationStore.currentPatientSessionId
          ? { id: consultationStore.currentPatientSessionId, patientName: 'Current Session', status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : null;
      }
      return patientSessions.find((s: any) => s.id === consultationStore.currentPatientSessionId) || null;
        },
    switchToPatientSession: (sessionId: string, onSwitch?: (sessionId: string, patientName: string) => void) => {
      // 🔧 STEP 1: CLEAR ALL LOCAL STATE FIRST (prevents state leakage between sessions)

      // Clear generated content
      consultationStore.setGeneratedNotes(null);
      consultationStore.setError(null);

      // Clear transcription state
      transcriptionStore.setTranscription('', false);
      transcriptionStore.setTypedInput('');

      // Clear consultation notes
      consultationStore.setConsultationNotes('');

      // Clear chat history
      consultationStore.clearChatHistory();

      // Clear consultation items
      const currentItems = [...consultationStore.consultationItems];
      currentItems.forEach((item: any) => consultationStore.removeConsultationItem(item.id));

      // Clear clinical images
      const currentImages = [...consultationStore.clinicalImages];
      currentImages.forEach((img: any) => consultationStore.removeClinicalImage(img.id));

      // Clear last generated tracking
      transcriptionStore.resetLastGeneratedInput();

      // 🔧 STEP 2: UPDATE SESSION POINTER
      consultationStore.setCurrentPatientSessionId(sessionId);
      const session = Array.isArray(patientSessions) ? patientSessions.find((s: any) => s.id === sessionId) : null;
      const patientName = session?.patientName || 'Current Session';

      // 🔧 STEP 3: PERSIST CURRENT SESSION SERVER-SIDE (for mobile fallback)
      try {
        const headers = { ...createAuthHeaders(userId), 'Content-Type': 'application/json' } as HeadersInit;
        fetch('/api/current-session', { method: 'PUT', headers, body: JSON.stringify({ sessionId }) }).catch(() => {});
      } catch {}

      // 🔧 STEP 4: LOAD SESSION DATA INTO LOCAL STORES (complete hydration)
      if (session) {
        // Load transcriptions (get the most recent one for display)
        try {
          if (session.transcriptions) {
            const trans = typeof session.transcriptions === 'string' ? JSON.parse(session.transcriptions) : session.transcriptions;
            if (Array.isArray(trans) && trans.length > 0) {
              const latest = trans[trans.length - 1];
              transcriptionStore.setTranscription(latest?.text || '', false, undefined, undefined);
            }
          }
        } catch (error) {
          console.warn('Failed to parse session transcriptions:', error);
        }

        // Load typed input
        if (session.typedInput) {
          transcriptionStore.setTypedInput(session.typedInput);
        }

        // Load generated notes
        if (session.notes) {
          consultationStore.setGeneratedNotes(session.notes);
        }

        // Load consultation notes
        if (session.consultationNotes) {
          consultationStore.setConsultationNotes(session.consultationNotes);
        }

        // Load template ID
        if (session.templateId) {
          consultationStore.setTemplateId(session.templateId);
        }

        // Load consultation items
        if (session.consultationItems) {
          try {
            const items = typeof session.consultationItems === 'string' ? JSON.parse(session.consultationItems) : session.consultationItems;
            if (Array.isArray(items)) {
              items.forEach((item: any) => {
                consultationStore.addConsultationItem({
                  type: item.type || 'other',
                  title: item.title || '',
                  content: item.content || '',
                });
              });
            }
          } catch (error) {
            console.warn('Failed to parse session consultation items:', error);
          }
        }

        // Load clinical images
        if (session.clinicalImages) {
          try {
            const imgs = typeof session.clinicalImages === 'string' ? JSON.parse(session.clinicalImages) : session.clinicalImages;
            if (Array.isArray(imgs)) {
              imgs.forEach((img: any) => consultationStore.addClinicalImage(img));
            }
          } catch (error) {
            console.warn('Failed to parse session clinical images:', error);
          }
        }
      }

      onSwitch?.(sessionId, patientName);
    },
    completePatientSession: async (sessionId: string): Promise<boolean> => {
      try {
        await updatePatientSession(sessionId, { status: 'completed' } as any);
        return true;
      } catch {
        return false;
      }
    },
  };
}
