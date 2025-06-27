'use client';

import type { ReactNode } from 'react';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

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

export type PatientSession = {
  id: string;
  patientName: string;
  status: 'active' | 'completed' | 'archived';
  transcriptions: string[];
  notes: string;
  templateId: string;
  consultationItems: ConsultationItem[];
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
    isLive: boolean;
  };
  typedInput: string;
  generatedNotes: string | null;
  error: string | null;
  userDefaultTemplateId: string | null;
  lastGeneratedTranscription?: string;
  lastGeneratedTypedInput?: string;
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
  // Mobile V2 state
  mobileV2: {
    isEnabled: boolean;
    token: string | null;
    connectedDevices: Array<{ deviceId: string; deviceName: string; connectedAt: number }>;
    connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  };
};

const MULTIPROBLEM_SOAP_UUID = 'ef6b3139-69a0-4b4b-bf80-dcdabe0559ba';

function getUserDefaultTemplateId() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userDefaultTemplateId');
  }
  return null;
}

const defaultState: ConsultationState = {
  sessionId: '',
  templateId: MULTIPROBLEM_SOAP_UUID,
  status: 'idle',
  inputMode: 'audio',
  transcription: { transcript: '', isLive: false },
  typedInput: '',
  generatedNotes: null,
  error: null,
  userDefaultTemplateId: null,
  consentObtained: false,
  microphoneGain: typeof window !== 'undefined'
    ? Number.parseFloat(localStorage.getItem('microphoneGain') || '7.0')
    : 7.0,
  volumeThreshold: typeof window !== 'undefined'
    ? Number.parseFloat(localStorage.getItem('volumeThreshold') || '0.1')
    : 0.1,
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
  // Mobile V2 defaults
  mobileV2: {
    isEnabled: false,
    token: null,
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
    setTranscription: (transcript: string, isLive: boolean) => void;
    appendTranscription: (newTranscript: string, isLive: boolean) => void;
    setTypedInput: (input: string) => void;
    setGeneratedNotes: (notes: string | null) => void;
    setError: (error: string | null) => void;
    resetConsultation: () => void;
    setUserDefaultTemplateId: (id: string) => void;
    setLastGeneratedInput: (transcription: string, typedInput?: string) => void;
    resetLastGeneratedInput: () => void;
    getCurrentTranscript: () => string;
    getCurrentInput: () => string;
    setConsentObtained: (consent: boolean) => void;
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
    createPatientSession: (patientName: string, templateId?: string) => Promise<PatientSession | null>;
    switchToPatientSession: (sessionId: string) => void;
    updatePatientSession: (sessionId: string, updates: Partial<PatientSession>) => void;
    completePatientSession: (sessionId: string) => void;
    loadPatientSessions: () => Promise<void>;
    getCurrentPatientSession: () => PatientSession | null;
    // Mobile V2 functions
    setMobileV2Token: (token: string | null) => void;
    setMobileV2ConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
    addMobileV2Device: (device: { deviceId: string; deviceName: string; connectedAt: number }) => void;
    removeMobileV2Device: (deviceId: string) => void;
    enableMobileV2: (enabled: boolean) => void;
  })
  | null
>(null);

export const ConsultationProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ConsultationState>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('consultationState');
      const userDefault = getUserDefaultTemplateId();
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          userDefaultTemplateId: userDefault,
          lastGeneratedTranscription: '',

          lastGeneratedTypedInput: '',
          consentObtained: false,
          // Ensure new fields have defaults if not present in stored data
          inputMode: parsed.inputMode || 'audio',
          typedInput: parsed.typedInput || '',

          // Ensure settings object exists
          settings: parsed.settings || {
            autoSave: false,
            microphoneGain: 7.0,
            volumeThreshold: 0.1,
          },
          // Ensure consultation notes exist
          consultationItems: parsed.consultationItems || [],
          consultationNotes: parsed.consultationNotes || '',
        };
      }
      return {
        ...defaultState,
        sessionId: generateSessionId(),
        templateId: userDefault || MULTIPROBLEM_SOAP_UUID,
        userDefaultTemplateId: userDefault,
      };
    }
    return { ...defaultState, sessionId: generateSessionId() };
  });

  useEffect(() => {
    localStorage.setItem('consultationState', JSON.stringify(state));
  }, [state]);

  // Helper functions
  const setStatus = useCallback((status: ConsultationState['status']) =>
    setState(prev => ({ ...prev, status })), []);

  const setTemplateId = useCallback((templateId: string) =>
    setState(prev => ({ ...prev, templateId })), []);

  const setInputMode = useCallback((inputMode: InputMode) =>
    setState(prev => ({ ...prev, inputMode })), []);

  const setTranscription = useCallback((transcript: string, isLive: boolean) => {
    setState(prev => ({
      ...prev,
      transcription: {
        transcript,
        isLive,
      },
    }));
  }, []);

  const appendTranscription = useCallback((newTranscript: string, isLive: boolean) => {
    setState(prev => ({
      ...prev,
      transcription: {
        transcript: prev.transcription.transcript
          ? `${prev.transcription.transcript} ${newTranscript}`.trim()
          : newTranscript.trim(),
        isLive,
      },
    }));
  }, []);

  const setTypedInput = useCallback((typedInput: string) =>
    setState(prev => ({ ...prev, typedInput })), []);

  const setGeneratedNotes = useCallback((notes: string | null) =>
    setState(prev => ({ ...prev, generatedNotes: notes })), []);

  const setError = useCallback((error: string | null) =>
    setState(prev => ({ ...prev, error })), []);

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

  const setLastGeneratedInput = useCallback((transcription: string, typedInput?: string) =>
    setState(prev => ({
      ...prev,
      lastGeneratedTranscription: transcription,
      lastGeneratedTypedInput: typedInput || '',
    })), []);

  const resetLastGeneratedInput = useCallback(() =>
    setState(prev => ({
      ...prev,
      lastGeneratedTranscription: '',
      lastGeneratedTypedInput: '',
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
      transcription: { transcript: '', isLive: false },
      typedInput: '',
      consentObtained: false,
    }));
  }, []);

  const getCurrentTranscript = useCallback(() => {
    return state.transcription.transcript.trim();
  }, [state.transcription.transcript]);

  const getCurrentInput = useCallback(() => {
    if (state.inputMode === 'typed') {
      return state.typedInput.trim();
    }
    return state.transcription.transcript.trim();
  }, [state.inputMode, state.typedInput, state.transcription.transcript]);

  const setConsentObtained = useCallback((consent: boolean) =>
    setState(prev => ({ ...prev, consentObtained: consent })), []);

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

  // Patient session management functions
  const createPatientSession = useCallback(async (patientName: string, templateId?: string): Promise<PatientSession | null> => {
    try {
      const response = await fetch('/api/patient-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
  }, [state.templateId]);

  const switchToPatientSession = useCallback((sessionId: string) => {
    setState(prev => ({
      ...prev,
      currentPatientSessionId: sessionId,
    }));
  }, []);

  const updatePatientSession = useCallback((sessionId: string, updates: Partial<PatientSession>) => {
    setState(prev => ({
      ...prev,
      patientSessions: prev.patientSessions.map(session =>
        session.id === sessionId ? { ...session, ...updates } : session,
      ),
    }));
  }, []);

  const completePatientSession = useCallback((sessionId: string) => {
    updatePatientSession(sessionId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
  }, [updatePatientSession]);

  const loadPatientSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/patient-sessions');
      if (response.ok) {
        const { sessions } = await response.json();
        setState(prev => ({
          ...prev,
          patientSessions: sessions,
        }));
      }
    } catch (error) {
      console.error('Error loading patient sessions:', error);
    }
  }, []);

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
      mobileV2: { ...prev.mobileV2, token },
    }));
  }, []);

  const setMobileV2ConnectionStatus = useCallback((status: 'disconnected' | 'connecting' | 'connected' | 'error') => {
    setState(prev => ({
      ...prev,
      mobileV2: { ...prev.mobileV2, connectionStatus: status },
    }));
  }, []);

  const addMobileV2Device = useCallback((device: { deviceId: string; deviceName: string; connectedAt: number }) => {
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
    resetConsultation,
    setUserDefaultTemplateId,
    setLastGeneratedInput,
    resetLastGeneratedInput,
    setConsentObtained,
    lastGeneratedTranscription: state.lastGeneratedTranscription || '',
    lastGeneratedTypedInput: state.lastGeneratedTypedInput || '',
    userDefaultTemplateId: state.userDefaultTemplateId,
    getCurrentTranscript,
    getCurrentInput,
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
    // Patient session functions
    createPatientSession,
    switchToPatientSession,
    updatePatientSession,
    completePatientSession,
    loadPatientSessions,
    getCurrentPatientSession,
    // Mobile V2 functions
    setMobileV2Token,
    setMobileV2ConnectionStatus,
    addMobileV2Device,
    removeMobileV2Device,
    enableMobileV2,
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
    resetConsultation,
    setUserDefaultTemplateId,
    setLastGeneratedInput,
    resetLastGeneratedInput,
    setConsentObtained,
    getCurrentTranscript,
    getCurrentInput,
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
    createPatientSession,
    switchToPatientSession,
    updatePatientSession,
    completePatientSession,
    loadPatientSessions,
    getCurrentPatientSession,
    setMobileV2Token,
    setMobileV2ConnectionStatus,
    addMobileV2Device,
    removeMobileV2Device,
    enableMobileV2,
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
