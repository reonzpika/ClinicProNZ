/**
 * Capture Panel Component
 * 
 * Provides:
 * - File upload (click to browse)
 * - Drag & drop
 * - Camera capture (desktop)
 * - Image compression before adding to session
 */

'use client';

import { Upload, Camera, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useImageWidgetStore } from '../../stores/imageWidgetStore';
import { useImageCompression } from '../../hooks/useImageCompression';
import { Button } from '@/src/shared/components/ui/button';

export function CapturePanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const { addImage, capabilities, setError } = useImageWidgetStore();
  const { compressImages, isCompressing, progress } = useImageCompression();
  
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }
    
    if (!capabilities) {
      setError('Capabilities not loaded yet');
      return;
    }
    
    const fileArray = Array.from(files);
    const limits = capabilities.limits.attachments;
    
    // Validate file types
    const invalidFiles = fileArray.filter(
      (file) => !limits.acceptedTypes.some((type) => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', ''));
        }
        return file.type === type;
      })
    );
    
    if (invalidFiles.length > 0) {
      setError(`Invalid file types: ${invalidFiles.map((f) => f.name).join(', ')}`);
      return;
    }
    
    // Validate count
    if (fileArray.length > limits.maxPerRequest) {
      setError(`Maximum ${limits.maxPerRequest} images per upload`);
      return;
    }
    
    try {
      // Compress images
      const compressed = await compressImages(fileArray, {
        maxSizeBytes: limits.maxSizeBytes,
      });
      
      // Add to store
      compressed.forEach((result) => {
        addImage({
          id: result.id,
          file: result.compressedFile,
          preview: result.preview,
          thumbnail: result.thumbnail,
          metadata: {},
          status: 'pending',
        });
      });
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process images');
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    handleFiles(e.dataTransfer.files);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  return (
    <>
      {/* Compact Buttons for Top Bar */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isCompressing}
          variant="outline"
          size="sm"
        >
          {isCompressing ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {progress}%
            </>
          ) : (
            <>
              <Upload className="mr-2 size-4" />
              Upload
            </>
          )}
        </Button>
        
        <Button
          onClick={() => cameraInputRef.current?.click()}
          disabled={isCompressing}
          variant="outline"
          size="sm"
        >
          <Camera className="mr-2 size-4" />
          Camera
        </Button>
      </div>
      
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </>
  );
}
