'use client';

import { Camera, Download, Trash2 } from 'lucide-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import type { ClinicalImage } from '@/shared/ConsultationContext';
import { useConsultation } from '@/shared/ConsultationContext';

type ClinicalImageUploadProps = {
  isMinimized?: boolean;
  onImageUploaded?: (image: ClinicalImage) => void;
};

export const ClinicalImageUpload: React.FC<ClinicalImageUploadProps> = ({
  isMinimized = false,
  onImageUploaded,
}) => {
  const {
    getCurrentPatientSession,
    addClinicalImage,
    removeClinicalImage,
    saveClinicalImagesToCurrentSession,
    currentPatientSessionId,
  } = useConsultation();

  const [isExpanded, setIsExpanded] = useState(!isMinimized);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSession = getCurrentPatientSession();
  const clinicalImages = useMemo(() => currentSession?.clinicalImages || [], [currentSession?.clinicalImages]);

  // Client-side image resizing
  const resizeImage = useCallback((file: File, maxSize: number = 1024): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and resize
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(blob!);
        }, file.type, 0.8); // 80% quality
      };

      img.src = URL.createObjectURL(file);
    });
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!currentPatientSessionId) {
      setError('No active patient session');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Client-side resize
      const resizedBlob = await resizeImage(file);

      // Get presigned URL
      const presignParams = new URLSearchParams({
        filename: file.name,
        mimeType: file.type,
        patientSessionId: currentPatientSessionId,
      });

      const presignResponse = await fetch(`/api/uploads/presign?${presignParams}`);
      if (!presignResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, key } = await presignResponse.json();

      // Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: resizedBlob,
        headers: {
          'Content-Type': file.type,
          'X-Amz-Server-Side-Encryption': 'AES256',
        },
      });

      if (!uploadResponse.ok) {
        console.error('S3 Upload failed:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          headers: Object.fromEntries(uploadResponse.headers.entries()),
          url: uploadUrl
        });
        
        const errorText = await uploadResponse.text().catch(() => 'No error details');
        console.error('S3 Error response:', errorText);
        
        throw new Error(`Failed to upload image (${uploadResponse.status}: ${uploadResponse.statusText})`);
      }

      // Create image metadata
      const newImage: ClinicalImage = {
        id: Math.random().toString(36).substr(2, 9),
        key,
        filename: file.name,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
      };

      // Add to context and save
      addClinicalImage(newImage);
      await saveClinicalImagesToCurrentSession([...clinicalImages, newImage]);

      onImageUploaded?.(newImage);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [
    currentPatientSessionId,
    resizeImage,
    addClinicalImage,
    saveClinicalImagesToCurrentSession,
    clinicalImages,
    onImageUploaded,
  ]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleRemoveImage = useCallback(async (imageId: string) => {
    const updatedImages = clinicalImages.filter(img => img.id !== imageId);
    removeClinicalImage(imageId);
    await saveClinicalImagesToCurrentSession(updatedImages);
  }, [clinicalImages, removeClinicalImage, saveClinicalImagesToCurrentSession]);

  const handleDownloadImage = useCallback(async (image: ClinicalImage) => {
    try {
      const response = await fetch(`/api/uploads/download?key=${encodeURIComponent(image.key)}`);
      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }

      const { downloadUrl } = await response.json();

      // Open in new tab for download
      window.open(downloadUrl, '_blank');
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download image');
    }
  }, []);

  const renderCharacterCount = () => {
    if (clinicalImages.length === 0) {
      return null;
    }
    return (
      <span className="text-xs text-slate-500">
        (
        {clinicalImages.length}
        {' '}
        image
        {clinicalImages.length === 1 ? '' : 's'}
        )
      </span>
    );
  };

  // Minimized view
  if (isMinimized) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-700">Clinical Images</span>
            {renderCharacterCount()}
          </div>
          <button
            type="button"
            className="h-6 px-2 text-xs text-slate-600 hover:text-slate-800"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
        {isExpanded && (
          <div className="space-y-2">
            {clinicalImages.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {clinicalImages.map(image => (
                  <div key={image.id} className="relative">
                    <Card className="overflow-hidden">
                      <CardContent className="p-2">
                        <div className="truncate text-xs text-slate-600">
                          {image.filename}
                        </div>
                        {image.aiDescription && (
                          <div className="mt-1 line-clamp-2 text-xs text-slate-500">
                            {image.aiDescription}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              size="sm"
              variant="outline"
              className="w-full"
            >
              <Camera size={14} className="mr-2" />
              {uploading ? 'Uploading...' : 'Add Image'}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Standard view
  if (!isExpanded) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Clinical Images (optional)</span>
            {renderCharacterCount()}
          </div>
          <button
            type="button"
            className="h-6 px-2 text-xs text-slate-600 hover:text-slate-800"
            onClick={() => setIsExpanded(true)}
          >
            +
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-700">
          Clinical Images (optional)
        </div>
        <button
          type="button"
          className="h-6 px-2 text-xs text-slate-600 hover:text-slate-800"
          onClick={() => setIsExpanded(false)}
        >
          −
        </button>
      </div>

      {error && (
        <div className="rounded bg-red-50 p-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Image Grid */}
      {clinicalImages.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clinicalImages.map(image => (
            <Card key={image.id} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="mb-2 flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-700">
                      {image.filename}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(image.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="ml-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownloadImage(image)}
                      className="size-6 p-0"
                    >
                      <Download size={12} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveImage(image.id)}
                      className="size-6 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>

                {image.aiDescription && (
                  <div className="mt-2 rounded bg-slate-50 p-2 text-xs text-slate-600">
                    <div className="mb-1 font-medium">AI Analysis:</div>
                    {image.aiDescription}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <div className="rounded-lg border-2 border-dashed border-slate-200 p-4 text-center">
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          variant="outline"
          className="gap-2"
        >
          <Camera size={16} />
          {uploading ? 'Uploading...' : 'Add Clinical Image'}
        </Button>
        <p className="mt-2 text-xs text-slate-500">
          Images are automatically resized and securely stored. They expire after consultation.
        </p>
      </div>

      {/* Hidden file input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
