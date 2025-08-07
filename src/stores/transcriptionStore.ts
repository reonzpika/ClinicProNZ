import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { TranscriptionWord, InputMode } from '@/src/types/consultation'

export interface TranscriptionData {
  transcript: string
  isLive: boolean
  utterances?: any[]
  diarizedTranscript?: string
  // Enhanced transcription features
  confidence?: number
  words?: TranscriptionWord[]
  paragraphs?: any
}

interface TranscriptionState {
  // Input mode
  inputMode: InputMode
  
  // Transcription state
  transcription: TranscriptionData
  typedInput: string
  
  // Consent and settings
  consentObtained: boolean
  microphoneGain: number
  volumeThreshold: number
  
  // Last generated input tracking
  lastGeneratedTranscription?: string
  lastGeneratedTypedInput?: string
  lastGeneratedCompiledConsultationText?: string
  lastGeneratedTemplateId?: string
}

interface TranscriptionActions {
  // Input mode actions
  setInputMode: (mode: InputMode) => void
  
  // Transcription actions
  setTranscription: (
    transcript: string, 
    isLive: boolean, 
    diarizedTranscript?: string, 
    utterances?: any[]
  ) => void
  
  setTranscriptionEnhanced: (
    transcript: string,
    isLive: boolean,
    diarizedTranscript?: string,
    utterances?: any[],
    confidence?: number,
    words?: TranscriptionWord[],
    paragraphs?: any
  ) => void
  
  appendTranscription: (
    newTranscript: string,
    isLive: boolean,
    source?: 'desktop' | 'mobile',
    deviceId?: string,
    diarizedTranscript?: string,
    utterances?: any[]
  ) => Promise<void>
  
  appendTranscriptionEnhanced: (
    newTranscript: string,
    isLive: boolean,
    source?: 'desktop' | 'mobile',
    deviceId?: string,
    diarizedTranscript?: string,
    utterances?: any[],
    confidence?: number,
    words?: TranscriptionWord[],
    paragraphs?: any
  ) => Promise<void>
  
  setTypedInput: (input: string) => void
  
  // Settings actions
  setConsentObtained: (consent: boolean) => void
  setMicrophoneGain: (gain: number) => void
  setVolumeThreshold: (threshold: number) => void
  
  // Last generated tracking actions
  setLastGeneratedInput: (
    transcription: string,
    typedInput?: string,
    compiledConsultationText?: string,
    templateId?: string
  ) => void
  resetLastGeneratedInput: () => void
  
  // Utility getters
  getCurrentTranscript: () => string
  getCurrentInput: () => string
  
  // Reset function
  resetTranscription: () => void
}

type TranscriptionStore = TranscriptionState & TranscriptionActions

const initialState: TranscriptionState = {
  inputMode: 'audio',
  transcription: { 
    transcript: '', 
    isLive: false, 
    utterances: [] 
  },
  typedInput: '',
  consentObtained: false,
  microphoneGain: 7.0,
  volumeThreshold: 0.1,
}

export const useTranscriptionStore = create<TranscriptionStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,
    
    // Input mode actions
    setInputMode: (mode) => set({ inputMode: mode }),
    
    // Transcription actions
    setTranscription: (transcript, isLive, diarizedTranscript, utterances) =>
      set({
        transcription: {
          transcript,
          isLive,
          diarizedTranscript,
          utterances,
        },
      }),
    
    setTranscriptionEnhanced: (
      transcript,
      isLive,
      diarizedTranscript,
      utterances,
      confidence,
      words,
      paragraphs
    ) =>
      set({
        transcription: {
          transcript,
          isLive,
          diarizedTranscript,
          utterances,
          confidence,
          words,
          paragraphs,
        },
      }),
    
    appendTranscription: async (
      newTranscript,
      isLive,
      _source,
      _deviceId,
      diarizedTranscript,
      utterances
    ) => {
      const current = get().transcription
      set({
        transcription: {
          transcript: current.transcript + newTranscript,
          isLive,
          diarizedTranscript: diarizedTranscript || current.diarizedTranscript,
          utterances: utterances || current.utterances,
        },
      })
    },
    
    appendTranscriptionEnhanced: async (
      newTranscript,
      isLive,
      _source,
      _deviceId,
      diarizedTranscript,
      utterances,
      confidence,
      words,
      paragraphs
    ) => {
      const current = get().transcription
      set({
        transcription: {
          transcript: current.transcript + newTranscript,
          isLive,
          diarizedTranscript: diarizedTranscript || current.diarizedTranscript,
          utterances: utterances || current.utterances,
          confidence: confidence || current.confidence,
          words: words || current.words,
          paragraphs: paragraphs || current.paragraphs,
        },
      })
    },
    
    setTypedInput: (input) => set({ typedInput: input }),
    
    // Settings actions
    setConsentObtained: (consent) => set({ consentObtained: consent }),
    setMicrophoneGain: (gain) => set({ microphoneGain: gain }),
    setVolumeThreshold: (threshold) => set({ volumeThreshold: threshold }),
    
    // Last generated tracking
    setLastGeneratedInput: (transcription, typedInput, compiledConsultationText, templateId) =>
      set({
        lastGeneratedTranscription: transcription,
        lastGeneratedTypedInput: typedInput,
        lastGeneratedCompiledConsultationText: compiledConsultationText,
        lastGeneratedTemplateId: templateId,
      }),
    
    resetLastGeneratedInput: () =>
      set({
        lastGeneratedTranscription: undefined,
        lastGeneratedTypedInput: undefined,
        lastGeneratedCompiledConsultationText: undefined,
        lastGeneratedTemplateId: undefined,
      }),
    
    // Utility getters
    getCurrentTranscript: () => get().transcription.transcript,
    getCurrentInput: () => {
      const { inputMode, transcription, typedInput } = get()
      return inputMode === 'audio' ? transcription.transcript : typedInput
    },
    
    // Reset function
    resetTranscription: () =>
      set({
        ...initialState,
        // Preserve settings that should persist
        microphoneGain: get().microphoneGain,
        volumeThreshold: get().volumeThreshold,
      }),
  }))
)