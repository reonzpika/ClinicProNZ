import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Types
export type ImageAnalysis = {
  id: string;
  prompt?: string;
  result: string;
  modelUsed?: string;
  analyzedAt: string;
};

export type ServerImage = {
  id: string;
  key: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  source: 'consultation' | 'mobile';
  sessionId?: string;
  tokenId?: string;
  analysis?: ImageAnalysis; // Latest analysis for this image
};

export type AnalysisModalState = {
  isOpen: boolean;
  image: ServerImage | null;
  prompt: string;
  analysis: string;
  isAnalysing: boolean;
};

export type CapturedPhoto = {
  id: string;
  blob: Blob;
  timestamp: string;
  filename: string;
  status: 'captured' | 'uploading' | 'uploaded' | 'failed';
};

export type UploadProgress = {
  photoId: string;
  progress: number;
  error?: string;
};

type ImageState = {
  // Device detection
  isMobile: boolean;

  // Desktop UI states
  showQR: boolean;
  error: string;

  // Analysis modal state
  analysisModal: AnalysisModalState;

  // Mobile states
  mobileState: 'connected' | 'camera' | 'reviewing';
  capturedPhotos: CapturedPhoto[];
  uploadProgress: UploadProgress[];
  isUploadingBatch: boolean;
};

type ImageActions = {
  // Device detection
  setIsMobile: (isMobile: boolean) => void;

  // Desktop UI actions
  setShowQR: (show: boolean) => void;
  setError: (error: string) => void;

  // Analysis modal actions
  openAnalysisModal: (image: ServerImage) => void;
  closeAnalysisModal: () => void;
  setAnalysisPrompt: (prompt: string) => void;
  setAnalysisResult: (analysis: string) => void;
  setAnalysisLoading: (isAnalysing: boolean) => void;

  // Mobile actions
  setMobileState: (state: 'connected' | 'camera' | 'reviewing') => void;
  addCapturedPhoto: (photo: CapturedPhoto) => void;
  updateCapturedPhoto: (photoId: string, updates: Partial<CapturedPhoto>) => void;
  removeCapturedPhoto: (photoId: string) => void;
  clearCapturedPhotos: () => void;

  // Upload progress actions
  setUploadProgress: (progress: UploadProgress[]) => void;
  updateUploadProgress: (photoId: string, updates: Partial<UploadProgress>) => void;
  addUploadProgress: (progress: UploadProgress) => void;
  removeUploadProgress: (photoId: string) => void;
  clearUploadProgress: () => void;
  setIsUploadingBatch: (isUploading: boolean) => void;
};

export const useImageStore = create<ImageState & ImageActions>()(
  subscribeWithSelector(set => ({
    // Initial state
    isMobile: false,
    showQR: false,
    error: '',
    analysisModal: {
      isOpen: false,
      image: null,
      prompt: '',
      analysis: '',
      isAnalysing: false,
    },
    mobileState: 'connected',
    capturedPhotos: [],
    uploadProgress: [],
    isUploadingBatch: false,

    // Device detection actions
    setIsMobile: isMobile => set({ isMobile }),

    // Desktop UI actions
    setShowQR: showQR => set({ showQR }),
    setError: error => set({ error }),

    // Analysis modal actions
    openAnalysisModal: image =>
      set({
        analysisModal: {
          isOpen: true,
          image,
          prompt: '',
          analysis: '',
          isAnalysing: false,
        },
      }),

    closeAnalysisModal: () =>
      set({
        analysisModal: {
          isOpen: false,
          image: null,
          prompt: '',
          analysis: '',
          isAnalysing: false,
        },
      }),

    setAnalysisPrompt: prompt =>
      set(state => ({
        analysisModal: { ...state.analysisModal, prompt },
      })),

    setAnalysisResult: analysis =>
      set(state => ({
        analysisModal: { ...state.analysisModal, analysis },
      })),

    setAnalysisLoading: isAnalysing =>
      set(state => ({
        analysisModal: { ...state.analysisModal, isAnalysing },
      })),

    // Mobile actions
    setMobileState: mobileState => set({ mobileState }),

    addCapturedPhoto: photo =>
      set(state => ({
        capturedPhotos: [...state.capturedPhotos, photo],
      })),

    updateCapturedPhoto: (photoId, updates) =>
      set(state => ({
        capturedPhotos: state.capturedPhotos.map(photo =>
          photo.id === photoId ? { ...photo, ...updates } : photo,
        ),
      })),

    removeCapturedPhoto: photoId =>
      set(state => ({
        capturedPhotos: state.capturedPhotos.filter(photo => photo.id !== photoId),
      })),

    clearCapturedPhotos: () => set({ capturedPhotos: [] }),

    // Upload progress actions
    setUploadProgress: uploadProgress => set({ uploadProgress }),

    updateUploadProgress: (photoId, updates) =>
      set(state => ({
        uploadProgress: state.uploadProgress.map(progress =>
          progress.photoId === photoId ? { ...progress, ...updates } : progress,
        ),
      })),

    addUploadProgress: progress =>
      set(state => ({
        uploadProgress: [...state.uploadProgress, progress],
      })),

    removeUploadProgress: photoId =>
      set(state => ({
        uploadProgress: state.uploadProgress.filter(progress => progress.photoId !== photoId),
      })),

    clearUploadProgress: () => set({ uploadProgress: [] }),

    setIsUploadingBatch: isUploadingBatch => set({ isUploadingBatch }),
  })),
);

export type ImageStore = ImageState & ImageActions;
