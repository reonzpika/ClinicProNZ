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
  };
  quickNotes: string[];
  generatedNotes: string | null;
  error: string | null;
};

const defaultState: ConsultationState = {
  sessionId: '',
  templateId: 'multiprobem soap',
  status: 'idle',
  transcription: { final: '', interim: '', isLive: false },
  quickNotes: [],
  generatedNotes: null,
  error: null,
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
    clearQuickNotes: () => void;
    setGeneratedNotes: (notes: string | null) => void;
    setError: (error: string | null) => void;
    resetConsultation: () => void;
  })
  | null
>(null);

export const ConsultationProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ConsultationState>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('consultationState');
      if (stored) {
        return JSON.parse(stored);
      }
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

  const setTranscription = (final: string, interim: string, isLive: boolean) =>
    setState(prev => ({ ...prev, transcription: { final, interim, isLive } }));

  const addQuickNote = (note: string) =>
    setState(prev => ({ ...prev, quickNotes: [...prev.quickNotes, note] }));

  const clearQuickNotes = () =>
    setState(prev => ({ ...prev, quickNotes: [] }));

  const setGeneratedNotes = (notes: string | null) =>
    setState(prev => ({ ...prev, generatedNotes: notes }));

  const setError = (error: string | null) =>
    setState(prev => ({ ...prev, error }));

  const resetConsultation = () =>
    setState({
      ...defaultState,
      sessionId: generateSessionId(),
      templateId: state.templateId || 'multiprobem soap',
    });

  const value = useMemo(() => ({
    ...state,
    setStatus,
    setTemplateId,
    setTranscription,
    addQuickNote,
    clearQuickNotes,
    setGeneratedNotes,
    setError,
    resetConsultation,
  }), [state, setStatus, setTemplateId, setTranscription, addQuickNote, clearQuickNotes, setGeneratedNotes, setError, resetConsultation]);

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
