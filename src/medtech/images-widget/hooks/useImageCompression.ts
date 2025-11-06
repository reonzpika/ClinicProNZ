/**
 * Hook to compress images with progress tracking
 */

import { useState, useCallback } from 'react';
import { compressImage, createThumbnail } from '../services/compression';
import type { CompressionOptions } from '../types';
import { useImageWidgetStore } from '../stores/imageWidgetStore';

interface UseImageCompressionResult {
  compressImages: (files: File[], options?: Partial<CompressionOptions>) => Promise<CompressedImageResult[]>;
  isCompressing: boolean;
  progress: number; // 0-100
  error: string | null;
}

export interface CompressedImageResult {
  id: string;
  originalFile: File;
  compressedFile: File;
  preview: string; // Data URL for preview
  thumbnail: string; // Smaller thumbnail for gallery
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export function useImageCompression(): UseImageCompressionResult {
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const compressImages = useCallback(async (
    files: File[],
    options?: Partial<CompressionOptions>
  ): Promise<CompressedImageResult[]> => {
    setIsCompressing(true);
    setProgress(0);
    setError(null);
    
    const results: CompressedImageResult[] = [];
    
    // Get current counter value at start of compression
    const startCounter = useImageWidgetStore.getState().imageCounter;
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file) {
          continue; // Skip if file is undefined
        }
        
        // Update progress
        setProgress(Math.round(((i + 0.5) / files.length) * 100));
        
        // Compress image
        const compressionResult = await compressImage(file, options);
        
        // Generate sequential filename using counter
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const imageNumber = startCounter + i + 1;
        const tempFileName = `image-${imageNumber}.${fileExtension === 'jpg' || fileExtension === 'jpeg' ? 'jpg' : fileExtension}`;
        
        // Rename compressed file with better temp name
        const renamedCompressedFile = new File(
          [compressionResult.compressedFile],
          tempFileName,
          { type: compressionResult.compressedFile.type }
        );
        
        // Create preview and thumbnail
        const [preview, thumbnail] = await Promise.all([
          URL.createObjectURL(renamedCompressedFile),
          createThumbnail(renamedCompressedFile),
        ]);
        
        results.push({
          id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
          originalFile: file,
          compressedFile: renamedCompressedFile,
          preview,
          thumbnail,
          originalSize: compressionResult.originalSize,
          compressedSize: compressionResult.compressedSize,
          compressionRatio: compressionResult.compressionRatio,
        });
        
        // Update progress
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to compress images';
      setError(errorMessage);
      throw err;
    } finally {
      setIsCompressing(false);
      setProgress(0);
    }
  }, []);
  
  return {
    compressImages,
    isCompressing,
    progress,
    error,
  };
}
