import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { ChatMessage, ClinicalImage, ConsultationItem } from '@/src/types/consultation';

export const MULTIPROBLEM_SOAP_UUID = '5f24a1c7-05a4-4622-a25b-4a19a5572196';
export const DEFAULT_TEMPLATE_ID = '20dc1526-62cc-4ff4-a370-ffc1ded52aef';

type ConsultationState = {
  // Session info
  sessionId: string;
  templateId: string;
  status: 'idle' | 'recording' | 'processing' | 'completed';

  // Generated content
  generatedNotes: string | null;
  error: string | null;

  // Settings and preferences
  userDefaultTemplateId: string | null;
  settings: {
    autoSave: boolean;
    microphoneGain: number;
    volumeThreshold: number;
  };

  // Chat state
  chatHistory: ChatMessage[];
  isChatContextEnabled: boolean;
  isChatLoading: boolean;

  // Consultation items and notes
  consultationItems: ConsultationItem[];
  consultationNotes: string;
  // New per-section fields (persisted in DB columns)
  problemsText: string;
  objectiveText: string;
  assessmentText: string;
  planText: string;
  // Dirty flags and edit timestamps for per-section fields
  problemsDirty?: boolean;
  objectiveDirty?: boolean;
  assessmentDirty?: boolean;
  planDirty?: boolean;
  problemsEditedAt?: number | null;
  objectiveEditedAt?: number | null;
  assessmentEditedAt?: number | null;
  planEditedAt?: number | null;

  // Clinical images
  clinicalImages: ClinicalImage[];

  // Current patient session
  currentPatientSessionId: string | null;

  // Guest token removed - authentication required
};

type ConsultationActions = {
  // Session actions
  setSessionId: (id: string) => void;
  setTemplateId: (id: string) => void;
  setStatus: (status: 'idle' | 'recording' | 'processing' | 'completed') => void;

  // Generated content actions
  setGeneratedNotes: (notes: string | null) => void;
  setError: (error: string | null) => void;

  // Settings actions
  setUserDefaultTemplateId: (id: string) => void;
  setAutoSave: (autoSave: boolean) => void;

  // Chat actions
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatHistory: () => void;
  setChatContextEnabled: (enabled: boolean) => void;
  setChatLoading: (loading: boolean) => void;

  // Consultation items actions
  addConsultationItem: (item: Omit<ConsultationItem, 'id' | 'timestamp'>) => void;
  removeConsultationItem: (itemId: string) => void;
  setConsultationNotes: (notes: string) => void;
  getCompiledConsultationText: () => string;
  // New per-section setters
  setProblemsText: (text: string) => void;
  setObjectiveText: (text: string) => void;
  setAssessmentText: (text: string) => void;
  setPlanText: (text: string) => void;
  // Hydration setters (do not mark dirty)
  hydrateProblemsText: (text: string) => void;
  hydrateObjectiveText: (text: string) => void;
  hydrateAssessmentText: (text: string) => void;
  hydratePlanText: (text: string) => void;
  // Clear dirty flags after successful save
  clearProblemsDirty: () => void;
  clearObjectiveDirty: () => void;
  clearAssessmentDirty: () => void;
  clearPlanDirty: () => void;

  // Clinical images actions
  addClinicalImage: (image: ClinicalImage) => void;
  removeClinicalImage: (imageId: string) => void;
  updateImageDescription: (imageId: string, description: string) => void;

  // Current patient session actions
  setCurrentPatientSessionId: (sessionId: string | null) => void;

  // Guest token actions removed - authentication required

  // Reset actions
  resetConsultation: () => void;
};

type ConsultationStore = ConsultationState & ConsultationActions;

function generateSessionId() {
  return Math.random().toString(36).substr(2, 9);
}

function getUserDefaultTemplateId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = localStorage.getItem('userDefaultTemplateId');
  // Migrate old default template ID to new one
  if (stored === 'ef6b3139-69a0-4b4b-bf80-dcdabe0559ba') {
    localStorage.setItem('userDefaultTemplateId', MULTIPROBLEM_SOAP_UUID);
    return MULTIPROBLEM_SOAP_UUID;
  }
  return stored;
}

function getCurrentPatientSessionId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('currentPatientSessionId');
}

const initialState: ConsultationState = {
  sessionId: generateSessionId(),
  templateId: DEFAULT_TEMPLATE_ID,
  status: 'idle',
  generatedNotes: null,
  error: null,
  userDefaultTemplateId: getUserDefaultTemplateId(),
  settings: {
    autoSave: false,
    microphoneGain: 7.0,
    volumeThreshold: 0.1,
  },
  chatHistory: [],
  isChatContextEnabled: false,
  isChatLoading: false,
  consultationItems: [],
  consultationNotes: '',
  problemsText: '',
  objectiveText: '',
  assessmentText: '',
  planText: '',
  problemsDirty: false,
  objectiveDirty: false,
  assessmentDirty: false,
  planDirty: false,
  problemsEditedAt: null,
  objectiveEditedAt: null,
  assessmentEditedAt: null,
  planEditedAt: null,
  clinicalImages: [],
  currentPatientSessionId: getCurrentPatientSessionId(),
};

export const useConsultationStore = create<ConsultationStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Session actions
    setSessionId: id => set({ sessionId: id }),
    setTemplateId: id => set({ templateId: id }),
    setStatus: status => set({ status }),

    // Generated content actions
    setGeneratedNotes: notes => set({ generatedNotes: notes }),
    setError: error => set({ error }),

    // Settings actions
    setUserDefaultTemplateId: (id) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('userDefaultTemplateId', id);
      }
      set({ userDefaultTemplateId: id });
    },
    setAutoSave: autoSave => set(state => ({
      settings: { ...state.settings, autoSave },
    })),

    // Chat actions
    addChatMessage: (message) => {
      const newMessage: ChatMessage = {
        ...message,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      set(state => ({
        chatHistory: [...state.chatHistory, newMessage],
      }));
    },
    clearChatHistory: () => set({ chatHistory: [] }),
    setChatContextEnabled: enabled => set({ isChatContextEnabled: enabled }),
    setChatLoading: loading => set({ isChatLoading: loading }),

    // Consultation items actions
    addConsultationItem: (item) => {
      const newItem: ConsultationItem = {
        ...item,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      set(state => ({
        consultationItems: [...state.consultationItems, newItem],
      }));
    },
    removeConsultationItem: itemId =>
      set(state => ({
        consultationItems: state.consultationItems.filter(item => item.id !== itemId),
      })),
    setConsultationNotes: notes => set({ consultationNotes: notes }),
    // New per-section setters (mark dirty for user edits)
    setProblemsText: (text: string) => set({ problemsText: text, problemsDirty: true, problemsEditedAt: Date.now() }),
    setObjectiveText: (text: string) => set({ objectiveText: text, objectiveDirty: true, objectiveEditedAt: Date.now() }),
    setAssessmentText: (text: string) => set({ assessmentText: text, assessmentDirty: true, assessmentEditedAt: Date.now() }),
    setPlanText: (text: string) => set({ planText: text, planDirty: true, planEditedAt: Date.now() }),
    // Hydration setters (no dirty flags)
    hydrateProblemsText: (text: string) => set({ problemsText: text }),
    hydrateObjectiveText: (text: string) => set({ objectiveText: text }),
    hydrateAssessmentText: (text: string) => set({ assessmentText: text }),
    hydratePlanText: (text: string) => set({ planText: text }),
    // Clear dirty flags (after save)
    clearProblemsDirty: () => set({ problemsDirty: false }),
    clearObjectiveDirty: () => set({ objectiveDirty: false }),
    clearAssessmentDirty: () => set({ assessmentDirty: false }),
    clearPlanDirty: () => set({ planDirty: false }),
    getCompiledConsultationText: () => {
      const { problemsText, objectiveText, assessmentText, planText } = get();
      const blocks: string[] = [];
      blocks.push('additional note:');
      const pushSection = (label: string, value: string) => {
        const v = (value || '').trim();
        if (!v) {
 return;
}
        blocks.push(`\n${label}:`);
        blocks.push(v);
      };
      pushSection('Problems', problemsText);
      pushSection('Objective', objectiveText);
      pushSection('Assessment', assessmentText);
      pushSection('Plan', planText);
      return blocks.join('\n');
    },

    // Clinical images actions
    addClinicalImage: image =>
      set(state => ({
        clinicalImages: [...state.clinicalImages, image],
      })),
    removeClinicalImage: imageId =>
      set(state => ({
        clinicalImages: state.clinicalImages.filter(img => img.id !== imageId),
      })),
    updateImageDescription: (imageId, description) =>
      set(state => ({
        clinicalImages: state.clinicalImages.map(img =>
          img.id === imageId ? { ...img, description } : img,
        ),
      })),

    // Current patient session actions
    setCurrentPatientSessionId: (sessionId) => {
      if (typeof window !== 'undefined') {
        if (sessionId) {
          localStorage.setItem('currentPatientSessionId', sessionId);
        } else {
          localStorage.removeItem('currentPatientSessionId');
        }
      }
      set({ currentPatientSessionId: sessionId });
    },

    // Guest token actions removed - authentication required

    // Reset actions
    resetConsultation: () => {
      const newSessionId = generateSessionId();
      set({
        sessionId: newSessionId,
        status: 'idle',
        generatedNotes: null,
        error: null,
        chatHistory: [],
        isChatLoading: false,
        consultationItems: [],
        consultationNotes: '',
        problemsText: '',
        objectiveText: '',
        assessmentText: '',
        planText: '',
        problemsDirty: false,
        objectiveDirty: false,
        assessmentDirty: false,
        planDirty: false,
        problemsEditedAt: null,
        objectiveEditedAt: null,
        assessmentEditedAt: null,
        planEditedAt: null,
        clinicalImages: [],
        // Preserve settings and templates
        templateId: get().userDefaultTemplateId || DEFAULT_TEMPLATE_ID,
      });
    },
  })),
);
