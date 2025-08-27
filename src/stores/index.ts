export { useConsultationStore } from './consultationStore';
export { useImageStore } from './imageStore';
export { useMobileStore } from './mobileStore';
export { useTranscriptionStore } from './transcriptionStore';

// Re-export types for convenience
export { MULTIPROBLEM_SOAP_UUID } from './consultationStore';
export type { AnalysisModalState, CapturedPhoto, ImageAnalysis, ServerImage, UploadProgress } from './imageStore';
export type { TranscriptionData } from './transcriptionStore';
export type { InputMode } from '@/src/types/consultation';
