'use client';

import { Camera, RotateCcw, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Alert } from '@/src/shared/components/ui/alert';
import { Button } from '@/src/shared/components/ui/button';

type WebRTCCameraProps = {
  onCapture: (photoBlob: Blob, filename: string) => void;
  onClose: () => void;
  maxImageSize?: number;
};

export const WebRTCCamera: React.FC<WebRTCCameraProps> = ({
  onCapture,
  onClose,
  maxImageSize = 1024, // Use 1024 as requested
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStreamActive, setIsStreamActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastCapturedImage, setLastCapturedImage] = useState<string | null>(null);

  // Initialize camera stream
  const initializeCamera = useCallback(async () => {
    try {
      setError(null);

      // Camera constraints with back camera preference
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' }, // Back camera
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreamActive(true);
      }
    } catch (err) {
      console.error('Failed to access camera:', err);
      let errorMessage = 'Camera access failed';

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please allow camera access and try again.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please ensure your device has a camera.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera is busy or unavailable. Close other apps using the camera and try again.';
        } else {
          errorMessage = `Camera error: ${err.message}`;
        }
      }

      setError(errorMessage);
    }
  }, []);

  // Clean up camera stream
  const cleanupCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    setIsStreamActive(false);
  }, []);

  // Resize image using canvas
  const resizeImage = useCallback((canvas: HTMLCanvasElement, maxSize: number): Promise<Blob> => {
    const { width: originalWidth, height: originalHeight } = canvas;

    // Calculate new dimensions maintaining aspect ratio
    let newWidth = originalWidth;
    let newHeight = originalHeight;

    if (originalWidth > originalHeight) {
      if (originalWidth > maxSize) {
        newWidth = maxSize;
        newHeight = (originalHeight * maxSize) / originalWidth;
      }
    } else if (originalHeight > maxSize) {
      newHeight = maxSize;
      newWidth = (originalWidth * maxSize) / originalHeight;
    }

    // Create new canvas with resized dimensions
    const resizedCanvas = document.createElement('canvas');
    const resizedCtx = resizedCanvas.getContext('2d')!;

    resizedCanvas.width = newWidth;
    resizedCanvas.height = newHeight;

    // Draw resized image
    resizedCtx.drawImage(canvas, 0, 0, newWidth, newHeight);

    // Convert to blob (JPEG with 80% quality for mobile optimization)
    return new Promise((resolve) => {
      resizedCanvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/jpeg', 0.8);
    });
  }, []);

  // Capture photo from video stream
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isStreamActive) {
      return;
    }

    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Resize image for mobile optimization
      const resizedBlob = await resizeImage(canvas, maxImageSize);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `mobile-photo-${timestamp}.jpg`;

      // Create preview URL for UI feedback
      const previewUrl = URL.createObjectURL(resizedBlob);
      setLastCapturedImage(previewUrl);

      // Call parent callback with captured photo
      onCapture(resizedBlob, filename);
    } catch (err) {
      console.error('Failed to capture photo:', err);
      setError('Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  }, [isStreamActive, onCapture, resizeImage, maxImageSize]);

  // Initialize camera on component mount
  useEffect(() => {
    initializeCamera();

    // Cleanup on unmount
    return cleanupCamera;
  }, [initializeCamera, cleanupCamera]);

  // Handle component unmount/close
  const handleClose = useCallback(() => {
    cleanupCamera();
    if (lastCapturedImage) {
      URL.revokeObjectURL(lastCapturedImage);
    }
    onClose();
  }, [cleanupCamera, lastCapturedImage, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="z-20 flex items-center justify-between p-4 text-white">
        <h2 className="text-lg font-semibold">Capture Clinical Image</h2>
        <Button
          onClick={handleClose}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10"
        >
          <X className="size-5" />
        </Button>
      </div>

      {/* Camera View */}
      <div className="relative flex-1">
        {error
          ? (
            <div className="flex h-full items-center justify-center p-4">
              <Alert variant="destructive" className="max-w-md">
                <div className="text-sm">{error}</div>
                <div className="mt-2 space-x-2">
                  <Button
                    onClick={initializeCamera}
                    size="sm"
                    variant="outline"
                  >
                    <RotateCcw className="mr-2 size-4" />
                    Retry
                  </Button>
                  <Button
                    onClick={handleClose}
                    size="sm"
                    variant="outline"
                  >
                    Close
                  </Button>
                </div>
              </Alert>
            </div>
          )
          : (
          <>
            {/* Video Stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="pointer-events-none size-full object-cover"
              style={{ transform: 'scaleX(-1)' }} // Mirror for selfie-style preview
            />

            {/* Capture Overlay */}
            {isStreamActive && (
              <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex items-center justify-center">
                  <Button
                    onClick={capturePhoto}
                    disabled={isCapturing}
                    size="lg"
                    className="size-16 rounded-full bg-white text-black hover:bg-gray-100"
                  >
                    {isCapturing
                      ? <div className="size-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
                      : <Camera className="size-8" />}
                  </Button>
                </div>

                {/* Instructions */}
                <div className="mt-4 text-center text-sm text-white/80">
                  {isCapturing ? 'Capturing...' : 'Tap to capture clinical image'}
                </div>
              </div>
            )}

            {/* Loading State */}
            {!isStreamActive && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-center text-white">
                  <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <p>Starting camera...</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Hidden canvas for image processing */}
      <canvas
        ref={canvasRef}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
};
