// Consultation-related types extracted from legacy ConsultationContext
// This ensures type safety during the migration to Zustand + React Query

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

// Enhanced transcription types for confidence and timestamp features
export type TranscriptionWord = {
  word: string;
  start: number;
  end: number;
  confidence: number;
  punctuated_word: string;
};

export type TranscriptionSentence = {
  text: string;
  start: number;
  end: number;
};

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
  // Mobile image specific fields
  isMobileImage?: boolean;
  mobileTokenId?: string;
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
  updatedAt: string;
  userId: string;
};
