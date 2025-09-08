import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { InputMode, TranscriptionWord } from '@/src/types/consultation';

export type TranscriptionData = {
  transcript: string;
  isLive: boolean;
  utterances?: any[];
  diarizedTranscript?: string;
  // Enhanced transcription features
  confidence?: number;
  words?: TranscriptionWord[];
  paragraphs?: any;
};

type TranscriptionState = {
  // Input mode
  inputMode: InputMode;

  // Transcription state
  transcription: TranscriptionData;
  typedInput: string;

  // Consent and settings
  consentObtained: boolean;
  microphoneGain: number;
  volumeThreshold: number;

  // Last generated input tracking
  lastGeneratedTranscription?: string;
  lastGeneratedTypedInput?: string;
  lastGeneratedCompiledConsultationText?: string;
  lastGeneratedTemplateId?: string;
};

type TranscriptionActions = {
  // Input mode actions
  setInputMode: (mode: InputMode) => void;

  // Transcription actions
  setTranscription: (
    transcript: string,
    isLive: boolean,
    diarizedTranscript?: string,
    utterances?: any[]
  ) => void;

  setTranscriptionEnhanced: (
    transcript: string,
    isLive: boolean,
    diarizedTranscript?: string,
    utterances?: any[],
    confidence?: number,
    words?: TranscriptionWord[],
    paragraphs?: any
  ) => void;

  appendTranscription: (
    newTranscript: string,
    isLive: boolean,
    source?: 'desktop' | 'mobile',
    deviceId?: string,
    diarizedTranscript?: string,
    utterances?: any[]
  ) => Promise<void>;

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
  ) => Promise<void>;

  setTypedInput: (input: string) => void;

  // Settings actions
  setConsentObtained: (consent: boolean) => void;
  setMicrophoneGain: (gain: number) => void;
  setVolumeThreshold: (threshold: number) => void;

  // Last generated tracking actions
  setLastGeneratedInput: (
    transcription: string,
    typedInput?: string,
    compiledConsultationText?: string,
    templateId?: string
  ) => void;
  resetLastGeneratedInput: () => void;

  // Utility getters
  getCurrentTranscript: () => string;
  getCurrentInput: () => string;

  // Reset function
  resetTranscription: () => void;
};

type TranscriptionStore = TranscriptionState & TranscriptionActions;

const initialState: TranscriptionState = {
  inputMode: 'audio',
  transcription: {
    transcript: '',
    isLive: false,
    utterances: [],
  },
  typedInput: '',
  consentObtained: false,
  microphoneGain: 7.0,
  volumeThreshold: 0.1,
};

export const useTranscriptionStore = create<TranscriptionStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Input mode actions
    setInputMode: mode => set({ inputMode: mode }),

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
      paragraphs,
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
      utterances,
    ) => {
      const current = get().transcription;
      set({
        transcription: {
          transcript: current.transcript + newTranscript,
          isLive,
          diarizedTranscript: diarizedTranscript || current.diarizedTranscript,
          utterances: utterances || current.utterances,
        },
      });
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
      paragraphs,
    ) => {
      const current = get().transcription;
      const normalizeToken = (w: string) => w.toLowerCase().replace(/[^a-z0-9']+/g, '');
      const splitTokens = (text: string) => (text.match(/\S+/g) || []);
      const findOverlapByTokens = (prevText: string, newTokens: string[]) => {
        const K = 20;
        const prevTokensRaw = splitTokens(prevText);
        const prevTokens = prevTokensRaw.map(normalizeToken);
        const prevWindow = prevTokens.slice(Math.max(0, prevTokens.length - K));
        const maxL = Math.min(prevWindow.length, newTokens.length);
        for (let L = maxL; L >= 3; L -= 1) {
          let match = true;
          for (let i = 0; i < L; i += 1) {
            if (prevWindow[prevWindow.length - L + i] !== newTokens[i]) {
              match = false;
              break;
            }
          }
          if (match) return L;
        }
        return 0;
      };
      const dropFirstTokens = (text: string, tokenCount: number) => {
        if (tokenCount <= 0) return text;
        const re = /\S+/g;
        let match: RegExpExecArray | null;
        let endIdx = 0;
        let count = 0;
        while ((match = re.exec(text)) !== null) {
          count += 1;
          endIdx = match.index + match[0].length;
          if (count >= tokenCount) break;
        }
        while (endIdx < text.length && /\s/.test(text[endIdx])) endIdx += 1;
        return text.slice(endIdx);
      };
      const newTokensFromWords = Array.isArray(words) && words.length > 0
        ? (words as any[]).map((w) => normalizeToken(String((w && (w as any).word) || ''))).filter(Boolean)
        : splitTokens(newTranscript).map(normalizeToken);
      const overlap = findOverlapByTokens(current.transcript, newTokensFromWords);
      const dedupedText = overlap > 0 ? dropFirstTokens(newTranscript, overlap) : newTranscript;
      const mergedText = (current.transcript + (current.transcript ? ' ' : '') + dedupedText).trim();
      set({
        transcription: {
          transcript: mergedText,
          isLive,
          diarizedTranscript: diarizedTranscript || current.diarizedTranscript,
          utterances: utterances || current.utterances,
          confidence: confidence || current.confidence,
          words: words || current.words,
          paragraphs: paragraphs || current.paragraphs,
        },
      });
    },

    setTypedInput: input => set({ typedInput: input }),

    // Settings actions
    setConsentObtained: consent => set({ consentObtained: consent }),
    setMicrophoneGain: gain => set({ microphoneGain: gain }),
    setVolumeThreshold: threshold => set({ volumeThreshold: threshold }),

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
      const { inputMode, transcription, typedInput } = get();
      return inputMode === 'audio' ? transcription.transcript : typedInput;
    },

    // Reset function
    resetTranscription: () =>
      set({
        ...initialState,
        // Preserve settings that should persist
        microphoneGain: get().microphoneGain,
        volumeThreshold: get().volumeThreshold,
      }),
  })),
);
