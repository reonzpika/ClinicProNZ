'use client';

import type { ReactNode } from 'react';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type ConsultationState = {
  sessionId: string;
  templateId: string;
  status: 'idle' | 'recording' | 'processing' | 'completed';
  transcription: {
    transcript: string;
    isLive: boolean;
  };
  quickNotes: string[];
  generatedNotes: string | null;
  error: string | null;
  userDefaultTemplateId: string | null;
  lastGeneratedTranscription?: string;
  lastGeneratedQuickNotes?: string[];
};

const MULTIPROBLEM_SOAP_UUID = 'a9028cb5-0c2a-4af9-9cc1-4087a6204715';

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
  transcription: { transcript: '', isLive: false },
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
    setTranscription: (transcript: string, isLive: boolean) => void;
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
    setQuickNotes: (notes: string[]) => void;
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
  const setStatus = useCallback((status: ConsultationState['status']) =>
    setState(prev => ({ ...prev, status })), []);

  const setTemplateId = useCallback((templateId: string) =>
    setState(prev => ({ ...prev, templateId })), []);

  const setTranscription = useCallback((transcript: string, isLive: boolean) => {
    setState(prev => ({
      ...prev,
      transcription: {
        transcript,
        isLive,
      },
    }));
  }, []);

  const addQuickNote = useCallback((note: string) =>
    setState(prev => ({ ...prev, quickNotes: [...prev.quickNotes, note] })), []);

  const deleteQuickNote = useCallback((index: number) =>
    setState(prev => ({
      ...prev,
      quickNotes: prev.quickNotes.filter((_, i) => i !== index),
    })), []);

  const clearQuickNotes = useCallback(() =>
    setState(prev => ({ ...prev, quickNotes: [] })), []);

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

  const setLastGeneratedInput = useCallback((transcription: string, quickNotes: string[]) =>
    setState(prev => ({
      ...prev,
      lastGeneratedTranscription: transcription,
      lastGeneratedQuickNotes: [...quickNotes],
    })), []);

  const resetLastGeneratedInput = useCallback(() =>
    setState(prev => ({
      ...prev,
      lastGeneratedTranscription: '',
      lastGeneratedQuickNotes: [],
    })), []);

  const resetConsultation = useCallback(() => {
    setState(prev => ({
      ...defaultState,
      sessionId: generateSessionId(),
      templateId: prev.userDefaultTemplateId || MULTIPROBLEM_SOAP_UUID,
      userDefaultTemplateId: prev.userDefaultTemplateId,
      lastGeneratedTranscription: '',
      lastGeneratedQuickNotes: [],
      transcription: { transcript: '', isLive: false },
    }));
  }, []);

  const getCurrentTranscript = useCallback(() => {
    return state.transcription.transcript.trim();
  }, [state.transcription.transcript]);

  const setQuickNotes = useCallback((notes: string[]) =>
    setState(prev => ({ ...prev, quickNotes: notes })), []);

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
    setQuickNotes,
    lastGeneratedTranscription: state.lastGeneratedTranscription || '',
    lastGeneratedQuickNotes: state.lastGeneratedQuickNotes || [],
    userDefaultTemplateId: state.userDefaultTemplateId,
    getCurrentTranscript,
  }), [
    state,
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
    setQuickNotes,
    getCurrentTranscript,
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
