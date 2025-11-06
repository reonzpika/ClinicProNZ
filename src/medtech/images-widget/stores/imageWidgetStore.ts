/**
 * Medtech Images Widget - Zustand Store
 * 
 * Central state management for the widget
 */

import { create } from 'zustand';
import type { WidgetImage, EncounterContext, Capabilities, CodeableConcept } from '../types';

interface ImageWidgetStore {
  // ============================================================================
  // Encounter Context (from Medtech Evolution)
  // ============================================================================
  
  encounterContext: EncounterContext | null;
  setEncounterContext: (context: EncounterContext) => void;
  
  // ============================================================================
  // Capabilities (from API)
  // ============================================================================
  
  capabilities: Capabilities | null;
  setCapabilities: (capabilities: Capabilities) => void;
  
  // ============================================================================
  // Session Images (uncommitted)
  // ============================================================================
  
  sessionImages: WidgetImage[];
  
  imageCounter: number; // Track sequential image numbering
  
  addImage: (image: WidgetImage) => void;
  removeImage: (id: string) => void;
  updateImage: (id: string, updates: Partial<WidgetImage>) => void;
  
  updateMetadata: (id: string, metadata: Partial<WidgetImage['metadata']>) => void;
  
  applyMetadataToImages: (sourceId: string, targetIds: string[]) => void;
  
  updateCommitOptions: (id: string, options: Partial<WidgetImage['commitOptions']>) => void;
  
  setImageStatus: (id: string, status: WidgetImage['status'], error?: string) => void;
  
  setImageResult: (id: string, result: WidgetImage['result']) => void;
  
  clearCommittedImages: () => void;
  clearAllImages: () => void;
  
  // ============================================================================
  // Selection State
  // ============================================================================
  
  selectedImageIds: string[];
  setSelectedImageIds: (ids: string[]) => void;
  toggleImageSelection: (id: string) => void;
  selectAllImages: () => void;
  clearSelection: () => void;
  
  // ============================================================================
  // UI State
  // ============================================================================
  
  showQR: boolean;
  setShowQR: (show: boolean) => void;
  
  isCommitDialogOpen: boolean;
  setCommitDialogOpen: (open: boolean) => void;
  
  error: string | null;
  setError: (error: string | null) => void;
  
  // ============================================================================
  // Sticky Metadata (last selected values for quick re-use)
  // ============================================================================
  
  stickyMetadata: {
    laterality?: CodeableConcept;
    bodySite?: CodeableConcept;
    view?: CodeableConcept;
    type?: CodeableConcept;
  };
  
  setStickyMetadata: (key: keyof ImageWidgetStore['stickyMetadata'], value: CodeableConcept) => void;
}

export const useImageWidgetStore = create<ImageWidgetStore>((set) => ({
  // Initial state
  encounterContext: null,
  capabilities: null,
  sessionImages: [],
  selectedImageIds: [],
  showQR: false,
  isCommitDialogOpen: false,
  error: null,
  stickyMetadata: {},
  imageCounter: 0, // Start at 0, will increment before use
  
  // Actions
  setEncounterContext: (context) => set({ encounterContext: context }),
  
  setCapabilities: (capabilities) => set({ capabilities }),
  
  addImage: (image) => set((state) => ({
    sessionImages: [...state.sessionImages, image],
    imageCounter: state.imageCounter + 1,
  })),
  
  removeImage: (id) => set((state) => ({
    sessionImages: state.sessionImages.filter((img) => img.id !== id),
    selectedImageIds: state.selectedImageIds.filter((imgId) => imgId !== id),
  })),
  
  updateImage: (id, updates) => set((state) => ({
    sessionImages: state.sessionImages.map((img) =>
      img.id === id ? { ...img, ...updates } : img
    ),
  })),
  
  updateMetadata: (id, metadata) => set((state) => ({
    sessionImages: state.sessionImages.map((img) =>
      img.id === id
        ? { ...img, metadata: { ...img.metadata, ...metadata } }
        : img
    ),
  })),
  
  applyMetadataToImages: (sourceId, targetIds) => set((state) => {
    // Find source image
    const sourceImage = state.sessionImages.find((img) => img.id === sourceId);
    if (!sourceImage) return state;
    
    // Copy laterality, bodySite, view, type (not label - that's image-specific)
    const metadataToCopy = {
      laterality: sourceImage.metadata.laterality,
      bodySite: sourceImage.metadata.bodySite,
      view: sourceImage.metadata.view,
      type: sourceImage.metadata.type,
    };
    
    // Apply to target images
    return {
      sessionImages: state.sessionImages.map((img) =>
        targetIds.includes(img.id)
          ? { ...img, metadata: { ...img.metadata, ...metadataToCopy } }
          : img
      ),
    };
  }),
  
  updateCommitOptions: (id, options) => set((state) => ({
    sessionImages: state.sessionImages.map((img) =>
      img.id === id
        ? { ...img, commitOptions: { ...img.commitOptions, ...options } }
        : img
    ),
  })),
  
  setImageStatus: (id, status, error) => set((state) => ({
    sessionImages: state.sessionImages.map((img) =>
      img.id === id ? { ...img, status, error } : img
    ),
  })),
  
  setImageResult: (id, result) => set((state) => ({
    sessionImages: state.sessionImages.map((img) =>
      img.id === id ? { ...img, result, status: 'committed' } : img
    ),
  })),
  
  clearCommittedImages: () => set((state) => ({
    sessionImages: state.sessionImages.filter((img) => img.status !== 'committed'),
  })),
  
  clearAllImages: () => set({ sessionImages: [], selectedImageIds: [], imageCounter: 0 }),
  
  setSelectedImageIds: (ids) => set({ selectedImageIds: ids }),
  
  toggleImageSelection: (id) => set((state) => {
    const isSelected = state.selectedImageIds.includes(id);
    return {
      selectedImageIds: isSelected
        ? state.selectedImageIds.filter((imgId) => imgId !== id)
        : [...state.selectedImageIds, id],
    };
  }),
  
  selectAllImages: () => set((state) => ({
    selectedImageIds: state.sessionImages.map((img) => img.id),
  })),
  
  clearSelection: () => set({ selectedImageIds: [] }),
  
  setShowQR: (show) => set({ showQR: show }),
  
  setCommitDialogOpen: (open) => set({ isCommitDialogOpen: open }),
  
  setError: (error) => set({ error }),
  
  setStickyMetadata: (key, value) => set((state) => ({
    stickyMetadata: { ...state.stickyMetadata, [key]: value },
  })),
}));
