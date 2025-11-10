/**
 * Capture Panel Component
 *
 * Compact upload button for desktop:
 * - File upload (click to browse)
 * - Image compression before adding to session
 */

'use client';

import { Loader2, Upload } from 'lucide-react';
import { useRef } from 'react';

import { Button } from '@/src/shared/components/ui/button';

import { useImageCompression } from '../../hooks/useImageCompression';
import { useImageWidgetStore } from '../../stores/imageWidgetStore';

export function CapturePanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addImage, capabilities, setError } = useImageWidgetStore();
  const { compressImages, isCompressing } = useImageCompression();

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
      file => !limits.acceptedTypes.some((type) => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', ''));
        }
        return file.type === type;
      }),
    );

    if (invalidFiles.length > 0) {
      setError(`Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}`);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Upload Button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isCompressing}
        size="sm"
        variant="default"
      >
        <Upload className="mr-2 size-4" />
        Upload
      </Button>

      {/* Progress Indicator */}
      {isCompressing && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="size-4 animate-spin" />
          <span>Processing...</span>
        </div>
      )}
    </div>
  );
}
