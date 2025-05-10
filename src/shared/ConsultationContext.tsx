'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ConsultationState = {
  sessionId: string;
  templateId: string;
  status: 'idle' | 'recording' | 'processing' | 'completed';
  transcription: {
    final: string;
    interim: string;
    isLive: boolean;
    interimBuffer: string;
  };
  quickNotes: string[];
  generatedNotes: string | null;
  error: string | null;
  userDefaultTemplateId: string | null;
  lastGeneratedTranscription?: string;
  lastGeneratedQuickNotes?: string[];
};

const MULTIPROBLEM_SOAP_UUID = 'cef98cee-0062-447f-83c3-537a2ac5bacb';

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
  transcription: { final: '', interim: '', isLive: false, interimBuffer: '' },
  quickNotes: [],
  generatedNotes: null,
  error: null,
  userDefaultTemplateId: null,
  lastGeneratedTranscription: '',
  lastGeneratedQuickNotes: [],
};

function generateSessionId() {
  return Math.random().toString(36).substr(2, 9);
}

const ConsultationContext = createContext<
  | (ConsultationState & {
    setStatus: (status: ConsultationState['status']) => void;
    setTemplateId: (id: string) => void;
    setTranscription: (final: string, interim: string, isLive: boolean) => void;
    addQuickNote: (note: string) => void;
    deleteQuickNote: (index: number) => void;
    clearQuickNotes: () => void;
    setGeneratedNotes: (notes: string | null) => void;
    setError: (error: string | null) => void;
    resetConsultation: () => void;
    setUserDefaultTemplateId: (id: string) => void;
    setLastGeneratedInput: (transcription: string, quickNotes: string[]) => void;
    resetLastGeneratedInput: () => void;
    getCurrentTranscript: () => string;
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
          lastGeneratedQuickNotes: [],
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
  const setStatus = (status: ConsultationState['status']) =>
    setState(prev => ({ ...prev, status }));

  const setTemplateId = (templateId: string) =>
    setState(prev => ({ ...prev, templateId }));

  const setTranscription = (final: string, interim: string, isLive: boolean) => {
    setState((prev) => {
      if (isLive) {
        return {
          ...prev,
          transcription: {
            ...prev.transcription,
            interim,
            isLive,
            interimBuffer: prev.transcription.interimBuffer
              ? `${prev.transcription.interimBuffer} ${interim}`
              : interim,
          },
        };
      } else {
        return {
          ...prev,
          transcription: {
            final: prev.transcription.interimBuffer.trim(),
            interim: '',
            isLive: false,
            interimBuffer: '',
          },
        };
      }
    });
  };

  const addQuickNote = (note: string) =>
    setState(prev => ({ ...prev, quickNotes: [...prev.quickNotes, note] }));

  const deleteQuickNote = (index: number) =>
    setState(prev => ({
      ...prev,
      quickNotes: prev.quickNotes.filter((_, i) => i !== index),
    }));

  const clearQuickNotes = () =>
    setState(prev => ({ ...prev, quickNotes: [] }));

  const setGeneratedNotes = (notes: string | null) =>
    setState(prev => ({ ...prev, generatedNotes: notes }));

  const setError = (error: string | null) =>
    setState(prev => ({ ...prev, error }));

  const setUserDefaultTemplateId = (id: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userDefaultTemplateId', id);
    }
    setState(prev => ({
      ...prev,
      userDefaultTemplateId: id,
      templateId: id,
    }));
  };

  const setLastGeneratedInput = (transcription: string, quickNotes: string[]) =>
    setState(prev => ({
      ...prev,
      lastGeneratedTranscription: transcription,
      lastGeneratedQuickNotes: [...quickNotes],
    }));

  const resetLastGeneratedInput = () =>
    setState(prev => ({
      ...prev,
      lastGeneratedTranscription: '',
      lastGeneratedQuickNotes: [],
    }));

  const resetConsultation = () => {
    setState(prev => ({
      ...defaultState,
      sessionId: generateSessionId(),
      templateId: prev.userDefaultTemplateId || MULTIPROBLEM_SOAP_UUID,
      userDefaultTemplateId: prev.userDefaultTemplateId,
      lastGeneratedTranscription: '',
      lastGeneratedQuickNotes: [],
      transcription: { final: '', interim: '', isLive: false, interimBuffer: '' },
    }));
  };

  const getCurrentTranscript = () => {
    return state.transcription.isLive
      ? state.transcription.interimBuffer.trim()
      : state.transcription.final.trim();
  };

  const value = useMemo(() => ({
    ...state,
    setStatus,
    setTemplateId,
    addQuickNote,
    deleteQuickNote,
    clearQuickNotes,
    setTranscription,
    setGeneratedNotes,
    setError,
    resetConsultation,
    setUserDefaultTemplateId,
    setLastGeneratedInput,
    resetLastGeneratedInput,
    lastGeneratedTranscription: state.lastGeneratedTranscription || '',
    lastGeneratedQuickNotes: state.lastGeneratedQuickNotes || [],
    userDefaultTemplateId: state.userDefaultTemplateId,
    getCurrentTranscript,
  }), [state, setStatus, setTemplateId, addQuickNote, deleteQuickNote, clearQuickNotes, setTranscription, setGeneratedNotes, setError, resetConsultation, setUserDefaultTemplateId, setLastGeneratedInput, resetLastGeneratedInput]);

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
