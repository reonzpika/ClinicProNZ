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
import { DEFAULT_TEMPLATE_ID, useConsultationStore } from '@/src/stores/consultationStore';
import { useTranscriptionStore } from '@/src/stores/transcriptionStore';
import { useUserSettingsStore } from '@/src/stores/userSettingsStore';
import type { PatientSession } from '@/src/types/consultation';

// Guard against duplicate session creations in slow networks
let __ensureSessionInFlight = false;
let __ensureSessionLastAt = 0;
let __ensureSessionPromise: Promise<string | null> | null = null;

// Facade hook used across the clinical UI. Provides a stable API over Zustand + TanStack state.
export function useConsultationStores(): any {
  const { isSignedIn: _isSignedIn, userId } = useAuth();
  const { hasSessionHistoryAccess } = useSessionAccess();

  const pathname = usePathname();

  // Zustand stores
  const transcriptionStore = useTranscriptionStore();
  const consultationStore = useConsultationStore();
  const { settings } = useUserSettingsStore();

  // Server state via React Query - disable on mobile routes
  const isMobileRoute = pathname === '/mobile';
  const {
    data: patientSessions = [],
    isLoading: patientSessionsLoading,
    isFetched: patientSessionsFetched,
  } = usePatientSessions(hasSessionHistoryAccess && !isMobileRoute);

  // Mutations
  const createSessionMutation = useCreatePatientSession();
  const updateSessionMutation = useUpdatePatientSession();
  const deleteSessionMutation = useDeletePatientSession();
  const deleteAllSessionsMutation = useDeleteAllPatientSessions();

  const updatePatientSession = useCallback(async (sessionId: string, updates: Partial<PatientSession>): Promise<void> => {
    await updateSessionMutation.mutateAsync({ sessionId, updates });
  }, [updateSessionMutation]);

  // ----------------------
  // Single Mutation Queue (client-only)
  // ----------------------
  type UpdateOp = { updates: Partial<PatientSession> };
  const queueKey = '__clinicproMutationQueueRef';
  const processingKey = '__clinicproMutationProcessingRef';
  const pausedKey = '__clinicproMutationPausedRef';
  const g: any = (typeof window !== 'undefined' ? window : globalThis) as any;
  if (!g[queueKey]) {
 g[queueKey] = { current: [] as UpdateOp[] };
}
  if (!g[processingKey]) {
 g[processingKey] = { current: false };
}
  if (!g[pausedKey]) {
 g[pausedKey] = { current: false };
}
  const mutationQueueRef = g[queueKey] as { current: UpdateOp[] };
  const processingRef = g[processingKey] as { current: boolean };
  const pausedRef = g[pausedKey] as { current: boolean };

  const processQueue = useCallback(async (): Promise<void> => {
    if (processingRef.current || pausedRef.current) {
      return;
    }
    const id = consultationStore.currentPatientSessionId;
    if (!id) {
      return;
    }
    const next = mutationQueueRef.current.shift();
    if (!next) {
      return;
    }
    processingRef.current = true;
    try {
      await updatePatientSession(id, next.updates);
    } catch {
      // keep optimistic UI; optionally log
    } finally {
      processingRef.current = false;
      if (!pausedRef.current && mutationQueueRef.current.length > 0) {
        setTimeout(() => {
          processQueue().catch(() => {});
        }, 0);
      }
    }
  }, [consultationStore.currentPatientSessionId, updatePatientSession, mutationQueueRef, pausedRef, processingRef]);

  const coalesceIntoQueue = useCallback((updates: Partial<PatientSession>) => {
    const tail = mutationQueueRef.current[mutationQueueRef.current.length - 1];
    if (tail) {
      tail.updates = { ...tail.updates, ...updates };
    } else {
      mutationQueueRef.current.push({ updates });
    }
  }, [mutationQueueRef]);

  const enqueueUpdate = useCallback((updates: Partial<PatientSession>) => {
    coalesceIntoQueue(updates);
    Promise.resolve().then(() => processQueue());
  }, [coalesceIntoQueue, processQueue]);

  const pauseMutations = useCallback(() => {
    pausedRef.current = true;
  }, [pausedRef]);
  const resumeMutations = useCallback(() => {
    pausedRef.current = false;
    Promise.resolve().then(() => processQueue());
  }, [processQueue, pausedRef]);

  const ensureActiveSession = useCallback(async (): Promise<string | null> => {
    // If a previous ensure is in progress, await it
    if (__ensureSessionPromise) {
      return __ensureSessionPromise;
    }

    __ensureSessionPromise = (async (): Promise<string | null> => {
      try {
        // Debounce/guard against rapid duplicate calls
        if (__ensureSessionInFlight) {
          return consultationStore.currentPatientSessionId || null;
        }
        if (Date.now() - __ensureSessionLastAt < 1200) {
          return consultationStore.currentPatientSessionId || null;
        }

        const localId = consultationStore.currentPatientSessionId;
        // If we have a local ID, validate it against fetched sessions (or best-effort fetch by ID)
        if (localId) {
          const hasLoadedList = Array.isArray(patientSessions) && patientSessions.length > 0;
          if (hasLoadedList) {
            const existsLocally = patientSessions.some((s: any) => s.id === localId);
            if (existsLocally) {
            // Align consent with current session
            try {
              transcriptionStore.setConsentForSessionId(localId);
            } catch {}
              return localId;
            }
          } else {
            // Validate by fetching the specific session from the server
            try {
              const res = await fetch(`/api/patient-sessions?sessionId=${encodeURIComponent(localId)}`, {
                method: 'GET',
                headers: createAuthHeaders(userId),
              });
              if (res.ok) {
                const data = await res.json();
                const sessions = Array.isArray(data?.sessions) ? data.sessions : [];
                if (sessions.length > 0) {
                  return localId;
                }
              }
            } catch {}
          }
          // Local ID is stale → clear it so we can create a new one
          consultationStore.setCurrentPatientSessionId(null);
          try { transcriptionStore.setConsentForSessionId(null); } catch {}
        }

        // If no local id, try to adopt server current session before creating a new one
        try {
          const res = await fetch('/api/current-session', {
            method: 'GET',
            headers: createAuthHeaders(userId),
          });
          if (res.ok) {
            const data = await res.json();
            const serverId = data?.currentSessionId as string | null;
            if (serverId && typeof serverId === 'string') {
              consultationStore.setCurrentPatientSessionId(serverId);
              try { transcriptionStore.setConsentForSessionId(null); } catch {}
              __ensureSessionLastAt = Date.now();
              return serverId;
            }
          }
        } catch {}

        // Create a brand-new session
        __ensureSessionInFlight = true;
        const patientName = 'Patient';
        const templateForNewSession = (settings?.favouriteTemplateId as string | undefined) || DEFAULT_TEMPLATE_ID;
        const result = await createSessionMutation.mutateAsync({ patientName, templateId: templateForNewSession });
        consultationStore.setCurrentPatientSessionId(result.id);
        consultationStore.setTemplateId(templateForNewSession);
        // Persist current session server-side (best-effort)
        try {
          const headers = { ...createAuthHeaders(userId), 'Content-Type': 'application/json' } as HeadersInit;
          fetch('/api/current-session', { method: 'PUT', headers, body: JSON.stringify({ sessionId: result.id }) }).catch(() => {});
        } catch {}
        __ensureSessionLastAt = Date.now();
        return result.id;
      } catch {
        return null;
      } finally {
        __ensureSessionInFlight = false;
      }
    })();

    try {
      return await __ensureSessionPromise;
    } finally {
      __ensureSessionPromise = null;
    }
  }, [consultationStore, createSessionMutation, patientSessions, settings?.favouriteTemplateId, userId]);

  // Hydrate local state when a persisted session is present but local is empty
  useEffect(() => {
    const currentSessionId = consultationStore.currentPatientSessionId;
    if (!Array.isArray(patientSessions)) {
      return;
    }
    // If local points to a missing session, clear it so ensureActiveSession can create a fresh one
    if (currentSessionId && patientSessions.length > 0) {
      const sessionExists = patientSessions.some((s: any) => s.id === currentSessionId);
      if (!sessionExists) {
        consultationStore.setCurrentPatientSessionId(null);
        // Best-effort: immediately ensure a valid active session
        try {
          (async () => {
            await ensureActiveSession();
          })();
        } catch {}
        return;
      }
    }
    if (!currentSessionId || patientSessions.length === 0) {
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
      || !!(session.consultationNotes && String(session.consultationNotes).trim())
      || !!(session.problemsText && String(session.problemsText).trim())
      || !!(session.objectiveText && String(session.objectiveText).trim())
      || !!(session.assessmentText && String(session.assessmentText).trim())
      || !!(session.planText && String(session.planText).trim());
    const hasRemote = hasRemoteTrans || hasRemoteTextFields;

    // Guard: avoid overwriting or clearing local when not needed
    if (hasLocal) {
      return;
    }
    if (!hasRemote) {
      return;
    }

    try {
      if (hasRemoteTrans) {
        const fullTranscript = remoteTrans.map((t: any) => (t?.text || '').trim()).join(' ');
        transcriptionStore.setTranscription(fullTranscript, false, undefined, undefined);
      }
    } catch {
      // ignore JSON errors
    }
    // Only update local state when values actually differ to avoid update loops
    if (session.typedInput && session.typedInput !== transcriptionStore.typedInput) {
      transcriptionStore.setTypedInput(session.typedInput);
    }
    if (session.notes && session.notes !== consultationStore.generatedNotes) {
      consultationStore.setGeneratedNotes(session.notes);
    }
    if (session.consultationNotes && session.consultationNotes !== consultationStore.consultationNotes) {
      consultationStore.setConsultationNotes(session.consultationNotes);
    }
    // Hydrate per-section fields with dirty/time guards
    const nextProblems = session.problemsText || '';
    const nextObjective = session.objectiveText || '';
    const nextAssessment = session.assessmentText || '';
    const nextPlan = session.planText || '';
    const now = Date.now();
    const recentMs = 3000;
    const problemsRecentlyEdited = !!(consultationStore.problemsEditedAt && (now - consultationStore.problemsEditedAt) < recentMs);
    const objectiveRecentlyEdited = !!(consultationStore.objectiveEditedAt && (now - consultationStore.objectiveEditedAt) < recentMs);
    const assessmentRecentlyEdited = !!(consultationStore.assessmentEditedAt && (now - consultationStore.assessmentEditedAt) < recentMs);
    const planRecentlyEdited = !!(consultationStore.planEditedAt && (now - consultationStore.planEditedAt) < recentMs);
    if (!consultationStore.problemsDirty && !problemsRecentlyEdited && nextProblems !== consultationStore.problemsText) {
      (consultationStore as any).hydrateProblemsText(nextProblems);
    }
    if (!consultationStore.objectiveDirty && !objectiveRecentlyEdited && nextObjective !== consultationStore.objectiveText) {
      (consultationStore as any).hydrateObjectiveText(nextObjective);
    }
    if (!consultationStore.assessmentDirty && !assessmentRecentlyEdited && nextAssessment !== consultationStore.assessmentText) {
      (consultationStore as any).hydrateAssessmentText(nextAssessment);
    }
    if (!consultationStore.planDirty && !planRecentlyEdited && nextPlan !== consultationStore.planText) {
      (consultationStore as any).hydratePlanText(nextPlan);
    }
    // One-time migration: consultationNotes -> objective if new fields empty
    try {
      const hasNewFields = !!(session.problemsText || session.objectiveText || session.assessmentText || session.planText);
      if (!hasNewFields && session.consultationNotes && String(session.consultationNotes).trim().length > 0) {
        updatePatientSession(session.id, { objectiveText: String(session.consultationNotes), consultationNotes: '' } as any).catch(() => {});
        consultationStore.setObjectiveText(String(session.consultationNotes));
        consultationStore.setConsultationNotes('');
      }
    } catch {}
    if (session.templateId && session.templateId !== consultationStore.templateId) {
      // Skip template hydration if a template lock is present (atomic clear)
      const locked = (consultationStore as any).templateLock;
      if (!locked) {
        consultationStore.setTemplateId(session.templateId);
      }
    }
  }, [
    // Scope hydration primarily to session/data changes, not keystrokes
    consultationStore.currentPatientSessionId,
    patientSessions,
    ensureActiveSession,
    updatePatientSession,
    consultationStore,
    transcriptionStore,
  ]);

  const createPatientSession = useCallback(async (patientName: string, templateId?: string): Promise<PatientSession | null> => {
    try {
      // Autosave current per-section fields before creating a new session
      const currentId = consultationStore.currentPatientSessionId;
      if (currentId) {
        const { problemsText, objectiveText, assessmentText, planText } = consultationStore as any;
        try {
          await updatePatientSession(currentId, { problemsText, objectiveText, assessmentText, planText } as any);
        } catch {}
      }

      const chosenTemplateId = templateId || (settings?.favouriteTemplateId as string | undefined) || DEFAULT_TEMPLATE_ID;
      const result = await createSessionMutation.mutateAsync({ patientName, templateId: chosenTemplateId });
      consultationStore.setTemplateId(chosenTemplateId);
      consultationStore.setCurrentPatientSessionId(result.id);
      return result;
    } catch {
      return null;
    }
  }, [createSessionMutation, consultationStore, settings?.favouriteTemplateId, updatePatientSession]);

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

  // Unified flows
  const finishCurrentSessionFresh = useCallback(async (): Promise<boolean> => {
    const currentId = consultationStore.currentPatientSessionId;
    if (!currentId) {
      return false;
    }
    try {
      pauseMutations();
      // Soft delete current
      await deleteSessionMutation.mutateAsync(currentId);
      // Create new with default template
      const newSession = await createSessionMutation.mutateAsync({ patientName: 'Patient', templateId: DEFAULT_TEMPLATE_ID });
      // Clear local UI state before switching to avoid stale render
      transcriptionStore.resetTranscription();
      consultationStore.resetConsultation();
      // Switch to new
      consultationStore.setCurrentPatientSessionId(newSession.id);
      try {
        const headers = { ...createAuthHeaders(userId), 'Content-Type': 'application/json' } as HeadersInit;
        fetch('/api/current-session', { method: 'PUT', headers, body: JSON.stringify({ sessionId: newSession.id }) }).catch(() => {});
      } catch {}
      // Hydrate via switch helper
      await (async () => {
        try {
          await (consultationStore as any).setTemplateId?.(newSession.templateId || DEFAULT_TEMPLATE_ID);
        } catch {}
      })();
      return true;
    } catch {
      return false;
    } finally {
      resumeMutations();
    }
  }, [consultationStore, transcriptionStore, pauseMutations, resumeMutations, deleteSessionMutation, createSessionMutation, userId]);

  const deleteSessionAndMaybeSwitch = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      pauseMutations();
      const res = await deleteSessionMutation.mutateAsync(sessionId);
      // If server provided a currentSessionId and we deleted current, switch
      try {
        const currentId = consultationStore.currentPatientSessionId;
        const nextId = (res as any)?.currentSessionId as string | undefined;
        if (nextId && currentId === sessionId) {
          // Clear local UI state before switching
          transcriptionStore.resetTranscription();
          consultationStore.resetConsultation();
          try { transcriptionStore.setConsentForSessionId(null); } catch {}
          consultationStore.setCurrentPatientSessionId(nextId);
          try {
            const headers = { ...createAuthHeaders(userId), 'Content-Type': 'application/json' } as HeadersInit;
            fetch('/api/current-session', { method: 'PUT', headers, body: JSON.stringify({ sessionId: nextId }) }).catch(() => {});
          } catch {}
        }
      } catch {}
      return true;
    } catch {
      return false;
    } finally {
      resumeMutations();
    }
  }, [consultationStore, transcriptionStore, pauseMutations, resumeMutations, deleteSessionMutation, userId]);

  const saveNotesToCurrentSession = useCallback(async (notes: string): Promise<boolean> => {
    const id = consultationStore.currentPatientSessionId;
    if (!id) {
      return false;
    }
    enqueueUpdate({ notes } as any);
    return true;
  }, [consultationStore.currentPatientSessionId, enqueueUpdate]);

  const saveTypedInputToCurrentSession = useCallback(async (typedInput: string): Promise<boolean> => {
    const id = consultationStore.currentPatientSessionId;
    if (!id) {
      return false;
    }
    enqueueUpdate({ typedInput } as any);
    return true;
  }, [consultationStore.currentPatientSessionId, enqueueUpdate]);

  // New per-section save helpers
  const saveProblemsToCurrentSession = useCallback(async (text: string): Promise<boolean> => {
    const id = consultationStore.currentPatientSessionId;
    if (!id) {
      return false;
    }
    enqueueUpdate({ problemsText: text } as any);
    try {
      consultationStore.clearProblemsDirty?.();
    } catch {}
    return true;
  }, [enqueueUpdate, consultationStore]);

  const saveObjectiveToCurrentSession = useCallback(async (text: string): Promise<boolean> => {
    const id = consultationStore.currentPatientSessionId;
    if (!id) {
      return false;
    }
    enqueueUpdate({ objectiveText: text } as any);
    try {
      consultationStore.clearObjectiveDirty?.();
    } catch {}
    return true;
  }, [enqueueUpdate, consultationStore]);

  const saveAssessmentToCurrentSession = useCallback(async (text: string): Promise<boolean> => {
    const id = consultationStore.currentPatientSessionId;
    if (!id) {
      return false;
    }
    enqueueUpdate({ assessmentText: text } as any);
    try {
      consultationStore.clearAssessmentDirty?.();
    } catch {}
    return true;
  }, [enqueueUpdate, consultationStore]);

  const savePlanToCurrentSession = useCallback(async (text: string): Promise<boolean> => {
    const id = consultationStore.currentPatientSessionId;
    if (!id) {
      return false;
    }
    enqueueUpdate({ planText: text } as any);
    try {
      consultationStore.clearPlanDirty?.();
    } catch {}
    return true;
  }, [enqueueUpdate, consultationStore]);

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
    patientSessionsLoading,
    patientSessionsFetched,

    // Last generated tracking
    lastGeneratedTranscription: transcriptionStore.lastGeneratedTranscription,
    lastGeneratedTypedInput: transcriptionStore.lastGeneratedTypedInput,
    lastGeneratedCompiledConsultationText: transcriptionStore.lastGeneratedCompiledConsultationText,
    lastGeneratedTemplateId: transcriptionStore.lastGeneratedTemplateId,

    // Actions - session/template
    setStatus: consultationStore.setStatus,
    setTemplateId: useCallback(async (id: string) => {
      if (consultationStore.templateId === id) {
        return;
      }
      consultationStore.setTemplateId(id);
      const sid = consultationStore.currentPatientSessionId;
      if (sid) {
        enqueueUpdate({ templateId: id } as any);
      }
    }, [enqueueUpdate, consultationStore]),

    // Actions - input/transcription
    setInputMode: transcriptionStore.setInputMode,
    setTranscription: transcriptionStore.setTranscription,
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
    // Per-section fields and setters
    problemsText: consultationStore.problemsText,
    objectiveText: consultationStore.objectiveText,
    assessmentText: consultationStore.assessmentText,
    planText: consultationStore.planText,
    // Per-section dirty flags (exposed for UI gating and autosave logic)
    problemsDirty: (consultationStore as any).problemsDirty,
    objectiveDirty: (consultationStore as any).objectiveDirty,
    assessmentDirty: (consultationStore as any).assessmentDirty,
    planDirty: (consultationStore as any).planDirty,
    // Per-section last edited timestamps (ms since epoch)
    problemsEditedAt: (consultationStore as any).problemsEditedAt,
    objectiveEditedAt: (consultationStore as any).objectiveEditedAt,
    assessmentEditedAt: (consultationStore as any).assessmentEditedAt,
    planEditedAt: (consultationStore as any).planEditedAt,
    setProblemsText: consultationStore.setProblemsText,
    setObjectiveText: consultationStore.setObjectiveText,
    setAssessmentText: consultationStore.setAssessmentText,
    setPlanText: consultationStore.setPlanText,
    // Hydration setters for programmatic updates (do not mark dirty)
    hydrateProblemsText: (consultationStore as any).hydrateProblemsText,
    hydrateObjectiveText: (consultationStore as any).hydrateObjectiveText,
    hydrateAssessmentText: (consultationStore as any).hydrateAssessmentText,
    hydratePlanText: (consultationStore as any).hydratePlanText,

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
    // Unified helpers
    finishCurrentSessionFresh,
    deleteSessionAndMaybeSwitch,
    saveNotesToCurrentSession,
    saveTypedInputToCurrentSession,
    saveProblemsToCurrentSession,
    saveObjectiveToCurrentSession,
    saveAssessmentToCurrentSession,
    savePlanToCurrentSession,

    // Mutation queue controls and atomic clear flag setters
    pauseMutations,
    resumeMutations,
    setClearInProgress: consultationStore.setClearInProgress,
    setClearedAt: consultationStore.setClearedAt,
    setTemplateLock: consultationStore.setTemplateLock,

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

    saveTranscriptionsToCurrentSession,

    // Session accessors
    loadPatientSessions: async () => {},
    getCurrentPatientSession: () => {
      if (!Array.isArray(patientSessions) || patientSessions.length === 0) {
        return null;
      }
      return patientSessions.find((s: any) => s.id === consultationStore.currentPatientSessionId) || null;
        },
    switchToPatientSession: async (sessionId: string, onSwitch?: (sessionId: string, patientName: string) => void) => {
      // 🔧 STEP 1: CLEAR ALL LOCAL STATE FIRST (prevents state leakage between sessions)
      // Autosave current per-section fields before switching
      try {
        const currentId = consultationStore.currentPatientSessionId;
        if (currentId) {
          const { problemsText, objectiveText, assessmentText, planText } = consultationStore as any;
          await updatePatientSession(currentId, { problemsText, objectiveText, assessmentText, planText } as any);
        }
      } catch {}

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
        // Load transcriptions (concatenate all chunks for full conversation)
        try {
          if (session.transcriptions) {
            const trans = typeof session.transcriptions === 'string' ? JSON.parse(session.transcriptions) : session.transcriptions;
            if (Array.isArray(trans) && trans.length > 0) {
              // ✅ FIX: Join all transcription chunks instead of showing only the last one
              const fullTranscript = trans.map((t: any) => t.text).join(' ');
              transcriptionStore.setTranscription(fullTranscript, false, undefined, undefined);
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

        // Load per-section fields from DB (authoritative)
        try {
          (consultationStore as any).hydrateProblemsText?.(session.problemsText || '');
          (consultationStore as any).hydrateObjectiveText?.(session.objectiveText || '');
          (consultationStore as any).hydrateAssessmentText?.(session.assessmentText || '');
          (consultationStore as any).hydratePlanText?.(session.planText || '');
          consultationStore.clearProblemsDirty?.();
          consultationStore.clearObjectiveDirty?.();
          consultationStore.clearAssessmentDirty?.();
          consultationStore.clearPlanDirty?.();
        } catch {}

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

    // Clinical images actions
    addClinicalImage: consultationStore.addClinicalImage,
    removeClinicalImage: consultationStore.removeClinicalImage,
    updateImageDescription: consultationStore.updateImageDescription,
    saveClinicalImagesToCurrentSession: async (images: any[]) => {
      const sid = consultationStore.currentPatientSessionId;
      if (sid) {
        await updatePatientSession(sid, { clinicalImages: images } as any);
      }
    },
  };
}
