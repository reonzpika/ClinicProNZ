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
  mobileRecording: {
    isActive: boolean;
    tokenGenerated: boolean;
    qrExpiry: string | null;
  };
  // Consultation notes
  consultationItems: ConsultationItem[];
  consultationNotes: string;
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
  mobileRecording: {
    isActive: false,
    tokenGenerated: false,
    qrExpiry: null,
  },
  // Consultation notes defaults
  consultationItems: [],
  consultationNotes: '',
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
    // Mobile recording functions
    setMobileRecordingActive: (active: boolean) => void;
    setMobileTokenGenerated: (generated: boolean, expiry?: string) => void;
    updateMobileRecordingSettings: (settings: Partial<ConsultationState['settings']>) => void;
    isDesktopRecordingDisabled: () => boolean;
    isMobileRecordingDisabled: () => boolean;
    appendMobileTranscription: (transcript: string, sessionId: string) => void;
    // Consultation notes functions
    addConsultationItem: (item: Omit<ConsultationItem, 'id' | 'timestamp'>) => void;
    removeConsultationItem: (itemId: string) => void;
    setConsultationNotes: (notes: string) => void;
    getCompiledConsultationText: () => string;
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
          // Ensure mobileRecording object exists and is properly initialized
          mobileRecording: parsed.mobileRecording || {
            isActive: false,
            tokenGenerated: false,
            qrExpiry: null,
          },
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

  // Mobile recording functions
  const setMobileRecordingActive = useCallback((active: boolean) => {
    setState(prev => ({
      ...prev,
      mobileRecording: {
        ...prev.mobileRecording,
        isActive: active,
      },
    }));
  }, []);

  const setMobileTokenGenerated = useCallback((generated: boolean, expiry?: string) => {
    setState(prev => ({
      ...prev,
      mobileRecording: {
        ...prev.mobileRecording,
        tokenGenerated: generated,
        qrExpiry: expiry || null,
      },
    }));
  }, []);

  const updateMobileRecordingSettings = useCallback((settings: Partial<ConsultationState['settings']>) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...settings,
      },
    }));
  }, []);

  // Check if desktop recording is disabled due to mobile activity
  const isDesktopRecordingDisabled = useCallback(() => {
    return state.mobileRecording.isActive;
  }, [state.mobileRecording.isActive]);

  // Check if mobile recording is disabled due to desktop activity
  const isMobileRecordingDisabled = useCallback(() => {
    return state.status === 'recording';
  }, [state.status]);

  const appendMobileTranscription = useCallback((transcript: string, sessionId: string) => {
    // Only append if the sessionId matches the current session
    if (sessionId === state.sessionId) {
      setState(prev => ({
        ...prev,
        transcription: {
          transcript: prev.transcription.transcript
            ? `${prev.transcription.transcript} ${transcript}`.trim()
            : transcript.trim(),
          isLive: true, // Mark as live since it's coming from mobile
        },
      }));
    }
  }, [state.sessionId]);

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
    // Mobile recording functions
    setMobileRecordingActive,
    setMobileTokenGenerated,
    updateMobileRecordingSettings,
    isDesktopRecordingDisabled,
    isMobileRecordingDisabled,
    appendMobileTranscription,
    // Consultation notes functions
    addConsultationItem,
    removeConsultationItem,
    setConsultationNotes,
    getCompiledConsultationText,
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
    setMobileRecordingActive,
    setMobileTokenGenerated,
    updateMobileRecordingSettings,
    isDesktopRecordingDisabled,
    isMobileRecordingDisabled,
    appendMobileTranscription,
    addConsultationItem,
    removeConsultationItem,
    setConsultationNotes,
    getCompiledConsultationText,
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
