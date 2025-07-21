'use client';

import { useAuth } from '@clerk/nextjs';
import type { ReactNode } from 'react';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { createAuthHeadersWithGuest } from '@/src/shared/utils';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

export type ConsultationItem = {
  id: string;
  type: 'checklist' | 'differential-diagnosis' | 'acc-code' | 'other';
  title: string;
  content: string;
  timestamp: number;
};

export type InputMode = 'audio' | 'typed';

export type TranscriptionEntry = {
  id: string;
  text: string;
  timestamp: string;
  source: 'desktop' | 'mobile';
  deviceId?: string;
};

export type ClinicalImage = {
  id: string;
  key: string; // S3 object key
  filename: string;
  mimeType: string;
  uploadedAt: string;
  aiDescription?: string;
};

export type PatientSession = {
  id: string;
  patientName: string;
  status: 'active' | 'completed' | 'archived';
  transcriptions: TranscriptionEntry[];
  notes: string;
  typedInput: string;
  consultationNotes: string;
  templateId: string;
  consultationItems: ConsultationItem[];
  clinicalImages: ClinicalImage[];
  createdAt: string;
  completedAt?: string;
};

export type ConsultationState = {
  sessionId: string;
  templateId: string;
  status: 'idle' | 'recording' | 'processing' | 'completed';
  inputMode: InputMode;
  transcription: {
    transcript: string;
    diarizedTranscript?: string;
    utterances?: any[];
    isLive: boolean;
  };
  // Structured transcript for enhanced note generation
  structuredTranscript: {
    content: string | null;
    originalTranscript: string | null;
    generatedAt: number | null;
    status: 'none' | 'structuring' | 'completed' | 'failed';
  };
  typedInput: string;
  generatedNotes: string | null;
  error: string | null;
  userDefaultTemplateId: string | null;
  lastGeneratedTranscription?: string;
  lastGeneratedTypedInput?: string;
  lastGeneratedCompiledConsultationText?: string;
  lastGeneratedTemplateId?: string;
  consentObtained: boolean;
  microphoneGain: number; // 1 to 10, default 7
  volumeThreshold: number; // 0.005 to 0.2, default 0.1
  // Chatbot state
  chatHistory: ChatMessage[];
  isChatContextEnabled: boolean;
  isChatLoading: boolean;
  settings: {
    autoSave: boolean;
    microphoneGain: number;
    volumeThreshold: number;
  };

  // Consultation notes
  consultationItems: ConsultationItem[];
  consultationNotes: string;
  // Patient session management (V2)
  patientSessions: PatientSession[];
  currentPatientSessionId: string | null;
  // Guest token for unauthenticated users
  guestToken: string | null;
  // Mobile V2 state
  mobileV2: {
    isEnabled: boolean;
    token: string | null;
    tokenData: {
      token: string;
      mobileUrl: string;
      expiresAt: string;
    } | null;
    connectedDevices: Array<{
      deviceId: string;
      deviceName: string;
      deviceType?: string;
      presenceKey?: string;
      connectedAt: number;
    }>;
    connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  };
};

export const MULTIPROBLEM_SOAP_UUID = '0ab5f900-7184-43d1-a262-c519ab9520dc';

function getUserDefaultTemplateId() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('userDefaultTemplateId');
    // Migrate old default template ID to new one
    if (stored === 'ef6b3139-69a0-4b4b-bf80-dcdabe0559ba') {
      localStorage.setItem('userDefaultTemplateId', MULTIPROBLEM_SOAP_UUID);
      return MULTIPROBLEM_SOAP_UUID;
    }
    return stored;
  }
  return null;
}

// Make defaultState completely static with no localStorage access
const defaultState: ConsultationState = {
  sessionId: '',
  templateId: MULTIPROBLEM_SOAP_UUID,
  status: 'idle',
  inputMode: 'audio',
  transcription: { transcript: '', isLive: false, utterances: [] },
  // Structured transcript defaults
  structuredTranscript: {
    content: null,
    originalTranscript: null,
    generatedAt: null,
    status: 'none',
  },
  typedInput: '',
  generatedNotes: null,
  error: null,
  userDefaultTemplateId: null,
  consentObtained: false,
  // Use static defaults - no localStorage access during SSR
  microphoneGain: 7.0,
  volumeThreshold: 0.1,
  // Chatbot defaults
  chatHistory: [],
  isChatContextEnabled: false,
  isChatLoading: false,
  settings: {
    autoSave: false,
    microphoneGain: 7.0,
    volumeThreshold: 0.1,
  },

  // Consultation notes defaults
  consultationItems: [],
  consultationNotes: '',
  // Patient session defaults
  patientSessions: [],
  currentPatientSessionId: null,
  // Guest token default
  guestToken: null,
  // Mobile V2 defaults
  mobileV2: {
    isEnabled: false,
    token: null,
    tokenData: null,
    connectedDevices: [],
    connectionStatus: 'disconnected',
  },
};

function generateSessionId() {
  return Math.random().toString(36).substr(2, 9);
}

const ConsultationContext = createContext<
  | (ConsultationState & {
    setStatus: (status: ConsultationState['status']) => void;
    setTemplateId: (id: string) => void;
    setInputMode: (mode: InputMode) => void;
    setTranscription: (transcript: string, isLive: boolean, diarizedTranscript?: string, utterances?: any[]) => void;
    appendTranscription: (newTranscript: string, isLive: boolean, source?: 'desktop' | 'mobile', deviceId?: string, diarizedTranscript?: string, utterances?: any[]) => Promise<void>;
    setTypedInput: (input: string) => void;
    setGeneratedNotes: (notes: string | null) => void;
    setError: (error: string | null) => void;
    setGuestToken: (guestToken: string | null) => void;
    resetConsultation: () => void;
    setUserDefaultTemplateId: (id: string) => void;
    setLastGeneratedInput: (transcription: string, typedInput?: string, compiledConsultationText?: string, templateId?: string) => void;
    resetLastGeneratedInput: () => void;
    getCurrentTranscript: () => string;
    getCurrentInput: () => string;
    setConsentObtained: (consent: boolean) => void;
    // Structured transcript functions
    setStructuredTranscriptStatus: (status: 'none' | 'structuring' | 'completed' | 'failed') => void;
    setStructuredTranscript: (content: string, originalTranscript: string) => void;
    clearStructuredTranscript: () => void;
    isStructuredTranscriptFresh: (transcript: string) => boolean;
    getEffectiveTranscript: () => string;
    // Chatbot functions
    addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
    clearChatHistory: () => void;
    setChatContextEnabled: (enabled: boolean) => void;
    setChatLoading: (loading: boolean) => void;
    setMicrophoneGain: (gain: number) => void;
    setVolumeThreshold: (threshold: number) => void;

    // Consultation notes functions
    addConsultationItem: (item: Omit<ConsultationItem, 'id' | 'timestamp'>) => void;
    removeConsultationItem: (itemId: string) => void;
    setConsultationNotes: (notes: string) => void;
    getCompiledConsultationText: () => string;
    // Patient session management functions
    ensureActiveSession: () => Promise<string | null>;
    createPatientSession: (patientName: string, templateId?: string) => Promise<PatientSession | null>;
    switchToPatientSession: (sessionId: string, onSwitch?: (sessionId: string, patientName: string) => void) => void;
    updatePatientSession: (sessionId: string, updates: Partial<PatientSession>) => Promise<void>;
    completePatientSession: (sessionId: string) => Promise<void>;
    deletePatientSession: (sessionId: string) => Promise<boolean>;
    deleteAllPatientSessions: () => Promise<boolean>;
    loadPatientSessions: () => Promise<void>;
    getCurrentPatientSession: () => PatientSession | null;
    // Guest token helper
    getEffectiveGuestToken: () => string | null;
    // Mobile V2 functions
    setMobileV2Token: (token: string | null) => void;
    setMobileV2TokenData: (tokenData: { token: string; mobileUrl: string; expiresAt: string } | null) => void;
    setMobileV2ConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
    addMobileV2Device: (device: {
      deviceId: string;
      deviceName: string;
      deviceType?: string;
      presenceKey?: string;
      connectedAt: number;
    }) => void;
    removeMobileV2Device: (deviceId: string) => void;
    enableMobileV2: (enabled: boolean) => void;
    saveNotesToCurrentSession: (notes: string) => Promise<boolean>;
    saveTypedInputToCurrentSession: (typedInput: string) => Promise<boolean>;
    saveConsultationNotesToCurrentSession: (consultationNotes: string) => Promise<boolean>;
    // Clinical images functions
    addClinicalImage: (image: ClinicalImage) => void;
    removeClinicalImage: (imageId: string) => void;
    updateImageDescription: (imageId: string, description: string) => void;
    saveClinicalImagesToCurrentSession: (clinicalImages: ClinicalImage[]) => Promise<boolean>;
  })
  | null
>(null);

// Generate or retrieve guest token for unauthenticated users only
function ensureGuestToken(isAuthenticated: boolean) {
  // Skip guest token generation for authenticated users
  if (isAuthenticated) {
    return null;
  }

  // Generate guest token for session tracking (unauthenticated users only)
  const existingToken = localStorage.getItem('guestToken');
  if (existingToken) {
    return existingToken;
  }

  // Generate new guest token
  const newToken = crypto.randomUUID();
  localStorage.setItem('guestToken', newToken);
  return newToken;
}

export const ConsultationProvider = ({ children }: { children: ReactNode }) => {
  const { isSignedIn, userId } = useAuth();
  const { getUserTier } = useClerkMetadata();

  // Get the current tier value instead of the function for stable dependency
  const userTier = getUserTier();

  // Initialize with static defaults - no localStorage access during SSR
  const [state, setState] = useState<ConsultationState>(() => ({
    ...defaultState,
    sessionId: generateSessionId(),
    // Set guest token only for unauthenticated users during initialization
    guestToken: typeof window !== 'undefined' ? ensureGuestToken(isSignedIn || false) : null,
  }));

  // Track if we're on the client side to prevent hydration mismatches
  const [isClient, setIsClient] = useState(false);

  // Client-side only: Restore state from localStorage after hydration
  useEffect(() => {
    setIsClient(true);

    const initializeState = () => {
      try {
        const stored = localStorage.getItem('consultationState');
        const userDefault = getUserDefaultTemplateId();

        // Load stored microphone settings immediately
        const microphoneGain = Number.parseFloat(localStorage.getItem('microphoneGain') || '7.0');
        const volumeThreshold = Number.parseFloat(localStorage.getItem('volumeThreshold') || '0.1');

        // Ensure guest token exists for unauthenticated users only
        const guestToken = ensureGuestToken(isSignedIn || false);

        if (stored) {
          const parsed = JSON.parse(stored);
          // Migrate old default template ID to new one
          const migratedTemplateId = parsed.templateId === 'ef6b3139-69a0-4b4b-bf80-dcdabe0559ba' ? MULTIPROBLEM_SOAP_UUID : parsed.templateId;

          setState({
            ...parsed,
            // Override with fresh values
            templateId: migratedTemplateId,
            userDefaultTemplateId: userDefault,
            lastGeneratedTranscription: '',
            lastGeneratedTypedInput: '',
            lastGeneratedCompiledConsultationText: '',
            lastGeneratedTemplateId: '',
            consentObtained: false,
            microphoneGain,
            volumeThreshold,
            // Ensure new fields have defaults if not present in stored data
            inputMode: parsed.inputMode || 'audio',
            typedInput: parsed.typedInput || '',
            settings: {
              autoSave: parsed.settings?.autoSave || false,
              microphoneGain,
              volumeThreshold,
            },
            // Ensure consultation notes exist
            consultationItems: parsed.consultationItems || [],
            consultationNotes: parsed.consultationNotes || '',
            // Set guest token for session tracking
            guestToken: parsed.guestToken || guestToken,
            // Ensure mobileV2 object exists
            mobileV2: {
              isEnabled: parsed.mobileV2?.isEnabled || false,
              token: parsed.mobileV2?.token || null, // Keep mobile token separate
              tokenData: parsed.mobileV2?.tokenData || null,
              connectedDevices: parsed.mobileV2?.connectedDevices || [],
              connectionStatus: parsed.mobileV2?.connectionStatus || 'disconnected',
            },
          });
        } else {
          // No stored state, just update with user defaults and settings
          // Migrate old default template ID if it exists in userDefault
          const migratedUserDefault = userDefault === 'ef6b3139-69a0-4b4b-bf80-dcdabe0559ba' ? MULTIPROBLEM_SOAP_UUID : userDefault;

          setState(prev => ({
            ...prev,
            templateId: migratedUserDefault || MULTIPROBLEM_SOAP_UUID,
            userDefaultTemplateId: migratedUserDefault,
            microphoneGain,
            volumeThreshold,
            settings: {
              ...prev.settings,
              microphoneGain,
              volumeThreshold,
            },
            // Set guest token for unauthenticated users only
            guestToken,
          }));
        }
      } catch (error) {
        console.warn('Failed to restore consultation state from localStorage:', error);
        // On error, just set user defaults and continue
        const userDefault = getUserDefaultTemplateId();
        const microphoneGain = Number.parseFloat(localStorage.getItem('microphoneGain') || '7.0');
        const volumeThreshold = Number.parseFloat(localStorage.getItem('volumeThreshold') || '0.1');

        // Migrate old default template ID if it exists in userDefault
        const migratedUserDefault = userDefault === 'ef6b3139-69a0-4b4b-bf80-dcdabe0559ba' ? MULTIPROBLEM_SOAP_UUID : userDefault;

        // Still try to get guest token even on error (unauthenticated users only)
        const guestToken = ensureGuestToken(isSignedIn || false);

        setState(prev => ({
          ...prev,
          templateId: migratedUserDefault || MULTIPROBLEM_SOAP_UUID,
          userDefaultTemplateId: migratedUserDefault,
          microphoneGain,
          volumeThreshold,
          settings: {
            ...prev.settings,
            microphoneGain,
            volumeThreshold,
          },
          guestToken,
        }));
      }
    };

    initializeState();
  }, [isSignedIn]);

  // Client-side only: Save state to localStorage
  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem('consultationState', JSON.stringify(state));
      } catch (error) {
        console.warn('Failed to save consultation state to localStorage:', error);
      }
    }
  }, [state, isClient]);

  // Client-side only: Validate mobile token after state restoration
  useEffect(() => {
    if (!isClient) {
      return;
    }

    const validateMobileToken = async (token: string) => {
      try {
        // Check if token is still valid by calling Ably token API
        const url = new URL('/api/ably/token', window.location.origin);
        url.searchParams.set('token', token);

        const response = await fetch(url.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          // Token is invalid/expired - clear it
          setState(prev => ({
            ...prev,
            mobileV2: {
              ...prev.mobileV2,
              token: null,
              tokenData: null,
              connectionStatus: 'disconnected',
              connectedDevices: [],
            },
          }));
        }
        // If response is ok, token is still valid - keep current state
      } catch (error) {
        console.warn('Failed to validate mobile token:', error);
        // On validation error, clear token to be safe
        setState(prev => ({
          ...prev,
          mobileV2: {
            ...prev.mobileV2,
            token: null,
            tokenData: null,
            connectionStatus: 'disconnected',
            connectedDevices: [],
          },
        }));
      }
    };

    // Validate mobile token if it exists
    const token = state.mobileV2?.token;
    if (token) {
      validateMobileToken(token);
    }
  }, [isClient, state.mobileV2?.token]); // Only run when isClient becomes true or token changes

  // Helper functions
  const setStatus = useCallback((status: ConsultationState['status']) =>
    setState(prev => ({ ...prev, status })), []);

  const setTemplateId = useCallback((templateId: string) =>
    setState(prev => ({ ...prev, templateId })), []);

  const setInputMode = useCallback((inputMode: InputMode) =>
    setState(prev => ({ ...prev, inputMode })), []);

  const setTranscription = useCallback((transcript: string, isLive: boolean, diarizedTranscript?: string, utterances?: any[]) => {
    setState(prev => ({
      ...prev,
      transcription: {
        transcript,
        diarizedTranscript,
        utterances: utterances || [],
        isLive,
      },
    }));
  }, []);

  const appendTranscription = useCallback(async (newTranscript: string, isLive: boolean, source: 'desktop' | 'mobile' = 'desktop', deviceId?: string, diarizedTranscript?: string, utterances?: any[]) => {
    const sessionId = state.currentPatientSessionId;

    setState(prev => ({
      ...prev,
      transcription: {
        transcript: prev.transcription.transcript
          ? `${prev.transcription.transcript} ${newTranscript}`.trim()
          : newTranscript.trim(),
        diarizedTranscript: diarizedTranscript
          ? (prev.transcription.diarizedTranscript
              ? `${prev.transcription.diarizedTranscript}\n\n${diarizedTranscript}`.trim()
              : diarizedTranscript.trim())
          : prev.transcription.diarizedTranscript,
        utterances: utterances !== undefined
          ? [...(prev.transcription.utterances || []), ...utterances]
          : (prev.transcription.utterances || []),
        isLive,
      },
    }));

    // Save to database if we have a session
    if (sessionId && newTranscript.trim()) {
      try {
        const transcriptionEntry: TranscriptionEntry = {
          id: Math.random().toString(36).substr(2, 9),
          text: newTranscript.trim(),
          timestamp: new Date().toISOString(),
          source,
          deviceId,
        };

        // Get current session's transcriptions
        const currentSession = state.patientSessions.find(s => s.id === sessionId);
        const updatedTranscriptions = [
          ...(currentSession?.transcriptions || []),
          transcriptionEntry,
        ];

        // Update session in database
        await fetch('/api/patient-sessions', {
          method: 'PUT',
          headers: createAuthHeadersWithGuest(userId, userTier, state.guestToken),
          body: JSON.stringify({
            sessionId,
            transcriptions: updatedTranscriptions,
          }),
        });

        // Update local state
        setState(prev => ({
          ...prev,
          patientSessions: prev.patientSessions.map(session =>
            session.id === sessionId
              ? { ...session, transcriptions: updatedTranscriptions }
              : session,
          ),
        }));
      } catch (error) {
        console.error('Failed to save transcription:', error);
      }
    }
  }, [state.currentPatientSessionId, state.patientSessions, userId, userTier, state.guestToken]);

  const setTypedInput = useCallback((typedInput: string) =>
    setState(prev => ({ ...prev, typedInput })), []);

  const setGeneratedNotes = useCallback((notes: string | null) =>
    setState(prev => ({ ...prev, generatedNotes: notes })), []);

  const setError = useCallback((error: string | null) =>
    setState(prev => ({ ...prev, error })), []);

  const setGuestToken = useCallback((guestToken: string | null) =>
    setState(prev => ({ ...prev, guestToken })), []);

  const setUserDefaultTemplateId = useCallback((id: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userDefaultTemplateId', id);
    }
    setState(prev => ({
      ...prev,
      userDefaultTemplateId: id,
      templateId: id,
    }));
  }, []);

  const setLastGeneratedInput = useCallback((transcription: string, typedInput?: string, compiledConsultationText?: string, templateId?: string) =>
    setState(prev => ({
      ...prev,
      lastGeneratedTranscription: transcription,
      lastGeneratedTypedInput: typedInput || '',
      lastGeneratedCompiledConsultationText: compiledConsultationText || '',
      lastGeneratedTemplateId: templateId || '',
    })), []);

  const resetLastGeneratedInput = useCallback(() =>
    setState(prev => ({
      ...prev,
      lastGeneratedTranscription: '',
      lastGeneratedTypedInput: '',
      lastGeneratedCompiledConsultationText: '',
      lastGeneratedTemplateId: '',
    })), []);

  const resetConsultation = useCallback(() => {
    setState(prev => ({
      ...defaultState,
      sessionId: generateSessionId(),
      templateId: prev.userDefaultTemplateId || MULTIPROBLEM_SOAP_UUID,
      userDefaultTemplateId: prev.userDefaultTemplateId,
      inputMode: 'audio',
      lastGeneratedTranscription: '',
      lastGeneratedTypedInput: '',
      lastGeneratedCompiledConsultationText: '',
      lastGeneratedTemplateId: '',
      transcription: { transcript: '', isLive: false, utterances: [] },
      // Reset structured transcript
      structuredTranscript: {
        content: null,
        originalTranscript: null,
        generatedAt: null,
        status: 'none',
      },
      typedInput: '',
      consentObtained: false,
      // Preserve patient session state
      patientSessions: prev.patientSessions,
      currentPatientSessionId: prev.currentPatientSessionId,
      // Preserve guest token for session tracking
      guestToken: prev.guestToken,
      // Preserve user-level settings that should persist across patient sessions
      mobileV2: prev.mobileV2, // Keep QR code and mobile device connections
      microphoneGain: prev.microphoneGain, // Keep user's microphone settings
      volumeThreshold: prev.volumeThreshold, // Keep user's volume settings
      settings: prev.settings, // Keep user's general settings
      chatHistory: prev.chatHistory, // Keep chat history (user-level context)
    }));
  }, []);

  const getCurrentTranscript = useCallback(() => {
    return state.transcription.diarizedTranscript || state.transcription.transcript.trim();
  }, [state.transcription.diarizedTranscript, state.transcription.transcript]);

  const getCurrentInput = useCallback(() => {
    if (state.inputMode === 'typed') {
      return state.typedInput.trim();
    }
    return state.transcription.transcript.trim();
  }, [state.inputMode, state.typedInput, state.transcription.transcript]);

  const setConsentObtained = useCallback((consent: boolean) =>
    setState(prev => ({ ...prev, consentObtained: consent })), []);

  // Structured transcript functions
  const setStructuredTranscriptStatus = useCallback((status: 'none' | 'structuring' | 'completed' | 'failed') => {
    setState(prev => ({
      ...prev,
      structuredTranscript: {
        ...prev.structuredTranscript,
        status,
      },
    }));
  }, []);

  const setStructuredTranscript = useCallback((content: string, originalTranscript: string) => {
    setState(prev => ({
      ...prev,
      structuredTranscript: {
        content,
        originalTranscript,
        generatedAt: Date.now(),
        status: 'completed',
      },
    }));
  }, []);

  const clearStructuredTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      structuredTranscript: {
        content: null,
        originalTranscript: null,
        generatedAt: null,
        status: 'none',
      },
    }));
  }, []);

  // Check if structured transcript is fresh (within 5 minutes and matches current transcript)
  const isStructuredTranscriptFresh = useCallback((transcript: string) => {
    const { structuredTranscript } = state;
    if (!structuredTranscript.content || !structuredTranscript.generatedAt || !structuredTranscript.originalTranscript) {
      return false;
    }

    // Check if it's within 5 minutes
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const isRecent = structuredTranscript.generatedAt > fiveMinutesAgo;

    // Check if the transcript matches (allowing for small changes)
    const originalNormalized = structuredTranscript.originalTranscript.trim().toLowerCase();
    const currentNormalized = transcript.trim().toLowerCase();
    const isSimilar = originalNormalized === currentNormalized;

    return isRecent && isSimilar && structuredTranscript.status === 'completed';
  }, [state.structuredTranscript]);

  // Get the best available transcript (structured if fresh, otherwise raw)
  const getEffectiveTranscript = useCallback(() => {
    const rawTranscript = getCurrentTranscript();

    if (isStructuredTranscriptFresh(rawTranscript) && state.structuredTranscript.content) {
      return state.structuredTranscript.content;
    }

    return rawTranscript;
  }, [getCurrentTranscript, isStructuredTranscriptFresh, state.structuredTranscript.content]);

  // Chatbot helper functions
  const addChatMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    setState(prev => ({
      ...prev,
      chatHistory: [...prev.chatHistory, newMessage],
    }));
  }, []);

  const clearChatHistory = useCallback(() =>
    setState(prev => ({ ...prev, chatHistory: [] })), []);

  const setChatContextEnabled = useCallback((enabled: boolean) =>
    setState(prev => ({ ...prev, isChatContextEnabled: enabled })), []);

  const setChatLoading = useCallback((loading: boolean) =>
    setState(prev => ({ ...prev, isChatLoading: loading })), []);

  const setMicrophoneGain = useCallback((gain: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('microphoneGain', gain.toString());
    }
    setState(prev => ({ ...prev, microphoneGain: gain }));
  }, []);

  const setVolumeThreshold = useCallback((threshold: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('volumeThreshold', threshold.toString());
    }
    setState(prev => ({ ...prev, volumeThreshold: threshold }));
  }, []);

  // Consultation notes functions
  const addConsultationItem = useCallback((item: Omit<ConsultationItem, 'id' | 'timestamp'>) => {
    const newItem: ConsultationItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    setState(prev => ({
      ...prev,
      consultationItems: [...prev.consultationItems, newItem],
    }));
  }, []);

  const removeConsultationItem = useCallback((itemId: string) => {
    setState(prev => ({
      ...prev,
      consultationItems: prev.consultationItems.filter(item => item.id !== itemId),
    }));
  }, []);

  const setConsultationNotes = useCallback((notes: string) => {
    setState(prev => ({ ...prev, consultationNotes: notes }));
  }, []);

  const getCompiledConsultationText = useCallback(() => {
    const itemsText = state.consultationItems.map(item => `${item.title}: ${item.content}`).join('\n\n');
    const manualNotes = state.consultationNotes.trim();

    if (itemsText && manualNotes) {
      return `${itemsText}\n\n${manualNotes}`;
    } else if (itemsText) {
      return itemsText;
    } else {
      return manualNotes;
    }
  }, [state.consultationItems, state.consultationNotes]);

  // Auto-create session helper
  const ensureActiveSession = useCallback(async (): Promise<string | null> => {
    // Return existing session if we have one
    if (state.currentPatientSessionId) {
      return state.currentPatientSessionId;
    }

    // Auto-create session with default name
    const now = new Date();
    const defaultName = `Patient ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    try {
      const response = await fetch('/api/patient-sessions', {
        method: 'POST',
        headers: createAuthHeadersWithGuest(userId, userTier, state.guestToken),
        body: JSON.stringify({
          patientName: defaultName,
          templateId: state.templateId,
        }),
      });

      if (response.ok) {
        const { session } = await response.json();

        // Update local state
        setState(prev => ({
          ...prev,
          patientSessions: [...prev.patientSessions, session],
          currentPatientSessionId: session.id,
        }));

        return session.id;
      }
    } catch (error) {
      console.error('Failed to auto-create session:', error);
    }

    return null;
  }, [state.currentPatientSessionId, state.templateId, userId, userTier, state.guestToken]);

  // Patient session management functions
  const createPatientSession = useCallback(async (patientName: string, templateId?: string): Promise<PatientSession | null> => {
    try {
      const response = await fetch('/api/patient-sessions', {
        method: 'POST',
        headers: createAuthHeadersWithGuest(userId, userTier, state.guestToken),
        body: JSON.stringify({
          patientName,
          templateId: templateId || state.templateId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create patient session');
      }

      const { session } = await response.json();

      setState(prev => ({
        ...prev,
        patientSessions: [...prev.patientSessions, session],
        currentPatientSessionId: session.id,
      }));

      return session;
    } catch (error) {
      console.error('Error creating patient session:', error);
      setError('Failed to create patient session');
      return null;
    }
  }, [state.templateId, userId, userTier, state.guestToken]);

  const switchToPatientSession = useCallback((sessionId: string, onSwitch?: (sessionId: string, patientName: string) => void) => {
    // Find the session and load its transcriptions
    const targetSession = state.patientSessions.find(session => session.id === sessionId);

    // Reconstruct transcript text from transcription entries
    let reconstructedTranscript = '';
    if (targetSession?.transcriptions) {
      reconstructedTranscript = targetSession.transcriptions
        .map(entry => entry.text)
        .join(' ')
        .trim();
    }

    setState(prev => ({
      ...prev,
      currentPatientSessionId: sessionId,
      // Load the session's transcript
      transcription: {
        transcript: reconstructedTranscript,
        isLive: false,
      },
      // Load session data
      generatedNotes: targetSession?.notes || null,
      typedInput: targetSession?.typedInput || '',
      consultationNotes: targetSession?.consultationNotes || '',
      consultationItems: targetSession?.consultationItems || [],
    }));

    // Notify about the switch
    if (onSwitch && targetSession) {
      onSwitch(sessionId, targetSession.patientName);
    }
  }, [state.patientSessions]);

  const updatePatientSession = useCallback(async (sessionId: string, updates: Partial<PatientSession>) => {
    // Update local state immediately for optimistic UI updates
    setState(prev => ({
      ...prev,
      patientSessions: prev.patientSessions.map(session =>
        session.id === sessionId ? { ...session, ...updates } : session,
      ),
    }));

    // Persist to database
    try {
      const response = await fetch('/api/patient-sessions', {
        method: 'PUT',
        headers: createAuthHeadersWithGuest(userId, userTier, state.guestToken),
        body: JSON.stringify({
          sessionId,
          ...updates,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update session');
      }

      const { session } = await response.json();

      // Update with server response to ensure consistency
      setState(prev => ({
        ...prev,
        patientSessions: prev.patientSessions.map(s =>
          s.id === sessionId ? session : s,
        ),
      }));
    } catch (error) {
      console.error('Error updating patient session:', error);
      // Revert optimistic update on failure
      setState(prev => ({
        ...prev,
        patientSessions: prev.patientSessions.map(session =>
          session.id === sessionId ? { ...session, ...updates } : session,
        ),
      }));
      throw error;
    }
  }, [userId, userTier, state.guestToken]);

  // New function to save notes to current session
  const saveNotesToCurrentSession = useCallback(async (notes: string) => {
    if (!state.currentPatientSessionId) {
      console.warn('No current patient session to save notes to');
      return false;
    }

    try {
      await updatePatientSession(state.currentPatientSessionId, { notes });
      return true;
    } catch (error) {
      console.error('Error saving notes to current session:', error);
      return false;
    }
  }, [state.currentPatientSessionId, updatePatientSession]);

  // Auto-save typed input to current session
  const saveTypedInputToCurrentSession = useCallback(async (typedInput: string) => {
    if (!state.currentPatientSessionId) {
      console.warn('No current patient session to save typed input to');
      return false;
    }

    try {
      await updatePatientSession(state.currentPatientSessionId, { typedInput });
      return true;
    } catch (error) {
      console.error('Error saving typed input to current session:', error);
      return false;
    }
  }, [state.currentPatientSessionId, updatePatientSession]);

  // Auto-save consultation notes to current session
  const saveConsultationNotesToCurrentSession = useCallback(async (consultationNotes: string) => {
    if (!state.currentPatientSessionId) {
      console.warn('No current patient session to save consultation notes to');
      return false;
    }

    try {
      await updatePatientSession(state.currentPatientSessionId, { consultationNotes });
      return true;
    } catch (error) {
      console.error('Error saving consultation notes to current session:', error);
      return false;
    }
  }, [state.currentPatientSessionId, updatePatientSession]);

  // Clinical images management functions
  const addClinicalImage = useCallback((image: ClinicalImage) => {
    setState((prev) => {
      const currentSession = prev.patientSessions.find(s => s.id === prev.currentPatientSessionId);
      if (!currentSession) {
        return prev;
      }

      const updatedImages = [...(currentSession.clinicalImages || []), image];
      return {
        ...prev,
        patientSessions: prev.patientSessions.map(session =>
          session.id === prev.currentPatientSessionId
            ? { ...session, clinicalImages: updatedImages }
            : session,
        ),
      };
    });
  }, []);

  const removeClinicalImage = useCallback((imageId: string) => {
    setState((prev) => {
      const currentSession = prev.patientSessions.find(s => s.id === prev.currentPatientSessionId);
      if (!currentSession) {
        return prev;
      }

      const updatedImages = (currentSession.clinicalImages || []).filter(img => img.id !== imageId);
      return {
        ...prev,
        patientSessions: prev.patientSessions.map(session =>
          session.id === prev.currentPatientSessionId
            ? { ...session, clinicalImages: updatedImages }
            : session,
        ),
      };
    });
  }, []);

  const updateImageDescription = useCallback((imageId: string, description: string) => {
    setState((prev) => {
      const currentSession = prev.patientSessions.find(s => s.id === prev.currentPatientSessionId);
      if (!currentSession) {
        return prev;
      }

      const updatedImages = (currentSession.clinicalImages || []).map(img =>
        img.id === imageId ? { ...img, aiDescription: description } : img,
      );
      return {
        ...prev,
        patientSessions: prev.patientSessions.map(session =>
          session.id === prev.currentPatientSessionId
            ? { ...session, clinicalImages: updatedImages }
            : session,
        ),
      };
    });
  }, []);

  const saveClinicalImagesToCurrentSession = useCallback(async (clinicalImages: ClinicalImage[]) => {
    if (!state.currentPatientSessionId) {
      console.warn('No current patient session to save clinical images to');
      return false;
    }

    try {
      await updatePatientSession(state.currentPatientSessionId, { clinicalImages });
      return true;
    } catch (error) {
      console.error('Error saving clinical images to current session:', error);
      return false;
    }
  }, [state.currentPatientSessionId, updatePatientSession]);

  const completePatientSession = useCallback(async (sessionId: string) => {
    await updatePatientSession(sessionId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });

    // Clear current session if we're completing the active session
    if (sessionId === state.currentPatientSessionId) {
      setState(prev => ({
        ...prev,
        currentPatientSessionId: null,
        transcription: { transcript: '', isLive: false },
      }));
    }
  }, [updatePatientSession, state.currentPatientSessionId]);

  const deletePatientSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/patient-sessions', {
        method: 'DELETE',
        headers: createAuthHeadersWithGuest(userId, userTier, state.guestToken),
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }

      // Update state - clear session data if we deleted the current session
      setState((prev) => {
        const isCurrentSession = prev.currentPatientSessionId === sessionId;
        return {
          ...prev,
          patientSessions: prev.patientSessions.filter(session => session.id !== sessionId),
          currentPatientSessionId: isCurrentSession ? null : prev.currentPatientSessionId,
          transcription: isCurrentSession ? { transcript: '', isLive: false } : prev.transcription,
        };
      });

      return true;
    } catch (error) {
      console.error('Error deleting patient session:', error);
      return false;
    }
  }, [userId, userTier, state.guestToken]);

  const deleteAllPatientSessions = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/patient-sessions', {
        method: 'DELETE',
        headers: createAuthHeadersWithGuest(userId, userTier, state.guestToken),
        body: JSON.stringify({ deleteAll: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete all sessions');
      }

      // Clear all sessions and current session state
      setState(prev => ({
        ...prev,
        patientSessions: [],
        currentPatientSessionId: null,
        transcription: { transcript: '', isLive: false },
        generatedNotes: null,
        typedInput: '',
        consultationNotes: '',
        consultationItems: [],
      }));

      return true;
    } catch (error) {
      console.error('Error deleting all patient sessions:', error);
      return false;
    }
  }, [userId, userTier, state.guestToken]);

  const loadPatientSessions = useCallback(async () => {
    // Don't make API calls if auth is still loading for signed-in users
    if (isSignedIn && !userId) {
      return;
    }

    try {
      const response = await fetch('/api/patient-sessions', {
        headers: createAuthHeadersWithGuest(userId, userTier, state.guestToken),
      });
      if (response.ok) {
        const { sessions } = await response.json();
        setState(prev => ({
          ...prev,
          patientSessions: sessions,
        }));
      } else {
        console.error('Failed to load patient sessions:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading patient sessions:', error);
    }
  }, [userId, userTier, state.guestToken, isSignedIn]);

  const getCurrentPatientSession = useCallback(() => {
    if (!state.currentPatientSessionId) {
      return null;
    }
    return state.patientSessions.find(session => session.id === state.currentPatientSessionId) || null;
  }, [state.currentPatientSessionId, state.patientSessions]);

  // Mobile V2 functions
  const setMobileV2Token = useCallback((token: string | null) => {
    setState(prev => ({
      ...prev,
      mobileV2: {
        ...prev.mobileV2,
        token,
        // Clear tokenData when token is cleared
        tokenData: token ? prev.mobileV2.tokenData : null,
      },
    }));
  }, []);

  const setMobileV2TokenData = useCallback((tokenData: { token: string; mobileUrl: string; expiresAt: string } | null) => {
    setState(prev => ({
      ...prev,
      mobileV2: {
        ...prev.mobileV2,
        token: tokenData?.token || null,
        tokenData,
      },
    }));
  }, []);

  const setMobileV2ConnectionStatus = useCallback((status: 'disconnected' | 'connecting' | 'connected' | 'error') => {
    setState(prev => ({
      ...prev,
      mobileV2: { ...prev.mobileV2, connectionStatus: status },
    }));
  }, []);

  const addMobileV2Device = useCallback((device: {
    deviceId: string;
    deviceName: string;
    deviceType?: string;
    presenceKey?: string;
    connectedAt: number;
  }) => {
    setState(prev => ({
      ...prev,
      mobileV2: {
        ...prev.mobileV2,
        connectedDevices: [
          ...prev.mobileV2.connectedDevices.filter(d => d.deviceId !== device.deviceId),
          device,
        ],
      },
    }));
  }, []);

  const removeMobileV2Device = useCallback((deviceId: string) => {
    setState(prev => ({
      ...prev,
      mobileV2: {
        ...prev.mobileV2,
        connectedDevices: prev.mobileV2.connectedDevices.filter(d => d.deviceId !== deviceId),
      },
    }));
  }, []);

  const enableMobileV2 = useCallback((enabled: boolean) => {
    setState(prev => ({
      ...prev,
      mobileV2: { ...prev.mobileV2, isEnabled: enabled },
    }));
  }, []);

  // Helper function to get effective guest token (fallback to mobileV2.token for backward compatibility)
  const getEffectiveGuestToken = useCallback(() => {
    return state.guestToken || state.mobileV2?.token || null;
  }, [state.guestToken, state.mobileV2?.token]);

  const value = useMemo(() => ({
    ...state,
    setStatus,
    setTemplateId,
    setInputMode,
    setTranscription,
    appendTranscription,
    setTypedInput,
    setGeneratedNotes,
    setError,
    setGuestToken,
    resetConsultation,
    setUserDefaultTemplateId,
    setLastGeneratedInput,
    resetLastGeneratedInput,
    setConsentObtained,
    lastGeneratedTranscription: state.lastGeneratedTranscription || '',
    lastGeneratedTypedInput: state.lastGeneratedTypedInput || '',
    lastGeneratedCompiledConsultationText: state.lastGeneratedCompiledConsultationText || '',
    lastGeneratedTemplateId: state.lastGeneratedTemplateId || '',
    userDefaultTemplateId: state.userDefaultTemplateId,
    getCurrentTranscript,
    getCurrentInput,
    // Structured transcript functions
    setStructuredTranscriptStatus,
    setStructuredTranscript,
    clearStructuredTranscript,
    isStructuredTranscriptFresh,
    getEffectiveTranscript,
    // Chatbot functions
    addChatMessage,
    clearChatHistory,
    setChatContextEnabled,
    setChatLoading,
    setMicrophoneGain,
    setVolumeThreshold,

    // Consultation notes functions
    addConsultationItem,
    removeConsultationItem,
    setConsultationNotes,
    getCompiledConsultationText,
    ensureActiveSession,
    createPatientSession,
    switchToPatientSession,
    updatePatientSession,
    completePatientSession,
    deletePatientSession,
    deleteAllPatientSessions,
    loadPatientSessions,
    getCurrentPatientSession,
    getEffectiveGuestToken,
    // Mobile V2 functions
    setMobileV2Token,
    setMobileV2TokenData,
    setMobileV2ConnectionStatus,
    addMobileV2Device,
    removeMobileV2Device,
    enableMobileV2,
    // New function
    saveNotesToCurrentSession,
    saveTypedInputToCurrentSession,
    saveConsultationNotesToCurrentSession,
    // Clinical images functions
    addClinicalImage,
    removeClinicalImage,
    updateImageDescription,
    saveClinicalImagesToCurrentSession,
  }), [
    state,
    setStatus,
    setTemplateId,
    setInputMode,
    setTranscription,
    appendTranscription,
    setTypedInput,
    setGeneratedNotes,
    setError,
    setGuestToken,
    resetConsultation,
    setUserDefaultTemplateId,
    setLastGeneratedInput,
    resetLastGeneratedInput,
    setConsentObtained,
    getCurrentTranscript,
    getCurrentInput,
    setStructuredTranscriptStatus,
    setStructuredTranscript,
    clearStructuredTranscript,
    isStructuredTranscriptFresh,
    getEffectiveTranscript,
    addChatMessage,
    clearChatHistory,
    setChatContextEnabled,
    setChatLoading,
    setMicrophoneGain,
    setVolumeThreshold,
    addConsultationItem,
    removeConsultationItem,
    setConsultationNotes,
    getCompiledConsultationText,
    ensureActiveSession,
    createPatientSession,
    switchToPatientSession,
    updatePatientSession,
    completePatientSession,
    deletePatientSession,
    deleteAllPatientSessions,
    loadPatientSessions,
    getCurrentPatientSession,
    getEffectiveGuestToken,
    setMobileV2Token,
    setMobileV2TokenData,
    setMobileV2ConnectionStatus,
    addMobileV2Device,
    removeMobileV2Device,
    enableMobileV2,
    saveNotesToCurrentSession,
    saveTypedInputToCurrentSession,
    saveConsultationNotesToCurrentSession,
    addClinicalImage,
    removeClinicalImage,
    updateImageDescription,
    saveClinicalImagesToCurrentSession,
  ]);

  return (
    <ConsultationContext.Provider value={value}>
      {children}
    </ConsultationContext.Provider>
  );
};

export const useConsultation = () => {
  const context = useContext(ConsultationContext);
  if (!context) {
    throw new Error('useConsultation must be used within ConsultationProvider');
  }
  return context;
};
