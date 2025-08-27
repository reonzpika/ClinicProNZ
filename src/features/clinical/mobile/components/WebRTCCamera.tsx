'use client';

import { Camera, RefreshCw, RotateCcw, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Alert } from '@/src/shared/components/ui/alert';
import { Button } from '@/src/shared/components/ui/button';

type WebRTCCameraProps = {
  onCapture: (photoBlob: Blob, filename: string) => void;
  onClose: () => void;
  maxImageSize?: number;
};

/**
 * Enhanced WebRTC Camera Component for Clinical Image Capture
 *
 * Key Features:
 * - Back-facing cameras only (no front-facing for clinical accuracy)
 * - Prioritizes wide-angle and standard lenses over telephoto
 * - No video mirroring to preserve clinical orientation (left/right accuracy)
 * - Video-only stream (no audio) for optimal performance
 * - High resolution capture with mobile optimization
 * - Enhanced error handling and camera selection
 */

export const WebRTCCamera: React.FC<WebRTCCameraProps> = ({
  onCapture,
  onClose,
  maxImageSize = 800, // 800px max for mobile bandwidth optimization
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStreamActive, setIsStreamActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastCapturedImage, setLastCapturedImage] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraId, setCurrentCameraId] = useState<string | null>(null);
  const [showCaptureFlash, setShowCaptureFlash] = useState(false);
  const [showCapturedPreview, setShowCapturedPreview] = useState(false);

  // Enumerate available cameras
  const enumerateCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');

      // Filter for back-facing cameras only, prioritizing wide/standard lenses
      const backCameras = videoDevices.filter((device) => {
        const label = device.label.toLowerCase();
        // Exclude front-facing cameras
        if (label.includes('front') || label.includes('selfie') || label.includes('user')) {
          return false;
        }
        // Exclude telephoto/zoom lenses for clinical accuracy
        if (label.includes('tele') || label.includes('zoom') || label.includes('3x') || label.includes('5x')) {
          return false;
        }
        // Include back, main, wide, ultra-wide, or standard cameras
        return label.includes('back')
          || label.includes('main')
          || label.includes('wide')
          || label.includes('standard')
          || label.includes('environment')
          || (!label.includes('front') && !label.includes('tele'));
      });

      // Sort cameras by preference: wide > standard > main > others
      const sortedBackCameras = backCameras.sort((a, b) => {
        const aLabel = a.label.toLowerCase();
        const bLabel = b.label.toLowerCase();

        // Prefer wide-angle cameras for better clinical documentation
        if (aLabel.includes('wide') && !bLabel.includes('wide')) {
 return -1;
}
        if (!aLabel.includes('wide') && bLabel.includes('wide')) {
 return 1;
}

        // Then prefer standard lenses
        if (aLabel.includes('standard') && !bLabel.includes('standard')) {
 return -1;
}
        if (!aLabel.includes('standard') && bLabel.includes('standard')) {
 return 1;
}

        // Then prefer main cameras
        if (aLabel.includes('main') && !bLabel.includes('main')) {
 return -1;
}
        if (!aLabel.includes('main') && bLabel.includes('main')) {
 return 1;
}

        return 0;
      });

      setAvailableCameras(sortedBackCameras);

      if (sortedBackCameras.length > 0 && !currentCameraId) {
        setCurrentCameraId(sortedBackCameras[0]!.deviceId);
      } else if (sortedBackCameras.length === 0 && videoDevices.length > 0) {
        // Fallback to any available camera if no back cameras found
        const fallbackCameras = videoDevices.filter((device) => {
          const label = device.label.toLowerCase();
          return !label.includes('front') && !label.includes('selfie');
        });
        setAvailableCameras(fallbackCameras);
        if (fallbackCameras.length > 0 && !currentCameraId) {
          setCurrentCameraId(fallbackCameras[0]!.deviceId);
        }
      }
    } catch (err) {
      console.error('Failed to enumerate cameras:', err);
    }
  }, [currentCameraId]);

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

  // Initialize camera stream
  const initializeCamera = useCallback(async (deviceId?: string) => {
    try {
      setError(null);

      // Enhanced camera constraints for clinical imaging
      const constraints: MediaStreamConstraints = {
        video: {
          ...(deviceId
            ? { deviceId: { exact: deviceId } }
            : {
                facingMode: { ideal: 'environment' },
                // Prefer wide-angle lenses for better clinical documentation
                advanced: [
                  { facingMode: 'environment' },
                  { width: { min: 1280 } },
                  { height: { min: 720 } },
                ],
              }),
          // High resolution for clinical detail
          width: { ideal: 1920, max: 4096 },
          height: { ideal: 1080, max: 2160 },
          // Frame rate optimized for still photography
          frameRate: { ideal: 30, max: 60 },
          // Image quality settings
          aspectRatio: { ideal: 16 / 9 },
        },
        // Explicitly disable audio for clinical image capture
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

  // Switch to next available camera (only cycles through filtered back cameras)
  const switchCamera = useCallback(async () => {
    if (availableCameras.length <= 1) {
 return;
}

    setError(null); // Clear any previous errors

    const currentIndex = availableCameras.findIndex(cam => cam.deviceId === currentCameraId);
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextCamera = availableCameras[nextIndex];

    if (nextCamera) {
      try {
        cleanupCamera();
        setCurrentCameraId(nextCamera.deviceId);

        // Provide user feedback about camera type
        const cameraType = nextCamera.label.toLowerCase().includes('wide')
? 'Wide-angle'
                          : nextCamera.label.toLowerCase().includes('standard')
? 'Standard'
                          : nextCamera.label.toLowerCase().includes('main') ? 'Main' : 'Back';

        console.log(`Switched to ${cameraType} camera: ${nextCamera.label}`);
      } catch (err) {
        console.error('Failed to switch camera:', err);
        setError('Failed to switch camera. Please try again.');
      }
    }
  }, [availableCameras, currentCameraId, cleanupCamera]);

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

      // Show capture flash effect
      setShowCaptureFlash(true);
      setTimeout(() => setShowCaptureFlash(false), 200);

      // Set canvas dimensions to match video for clinical accuracy
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Clear canvas and draw current video frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw video frame directly without any transformation for clinical accuracy
      // This ensures left/right orientation is preserved for medical documentation
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Resize image for mobile optimization while maintaining quality
      const resizedBlob = await resizeImage(canvas, maxImageSize);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `mobile-photo-${timestamp}.jpg`;

      // Create preview URL for UI feedback
      const previewUrl = URL.createObjectURL(resizedBlob);
      setLastCapturedImage(previewUrl);

      // Show captured image preview
      setShowCapturedPreview(true);
      setTimeout(() => setShowCapturedPreview(false), 2000);

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
    const setup = async () => {
      await enumerateCameras();
    };

    setup();

    // Cleanup on unmount
    return cleanupCamera;
  }, [enumerateCameras, cleanupCamera]);

  // Initialize camera when device is selected
  useEffect(() => {
    if (currentCameraId) {
      initializeCamera(currentCameraId);
    }
  }, [currentCameraId, initializeCamera]);

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
        <div className="flex items-center gap-2">
          {/* Camera Switch Button */}
          {availableCameras.length > 1 && (
            <Button
              onClick={switchCamera}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              title="Switch Camera"
            >
              <RefreshCw className="size-5" />
            </Button>
          )}
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <X className="size-5" />
          </Button>
        </div>
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
                    onClick={() => initializeCamera()}
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
              // Removed mirroring for clinical accuracy - no transform applied
            />

            {/* Capture Flash Effect */}
            {showCaptureFlash && (
              <div className="absolute inset-0 z-30 bg-white opacity-80" />
            )}

            {/* Captured Image Preview */}
            {showCapturedPreview && lastCapturedImage && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
                <div className="rounded-lg bg-white p-2 shadow-lg">
                  <img
                    src={lastCapturedImage}
                    alt="Captured preview"
                    className="size-32 rounded object-cover"
                  />
                  <div className="mt-2 text-center text-sm font-medium text-green-600">
                    ✓ Photo Captured
                  </div>
                </div>
              </div>
            )}

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
                      ? (
                        <div className="size-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
                      )
                      : (
                        <Camera className="size-8" />
                      )}
                  </Button>
                </div>

                {/* Instructions and Camera Info */}
                <div className="mt-4 text-center">
                  <div className="text-sm text-white/80">
                    {isCapturing ? 'Capturing...' : 'Tap to capture clinical image'}
                  </div>
                  {availableCameras.length > 0 && (
                    <div className="mt-1 text-xs text-white/60">
                      {(() => {
                        const currentCamera = availableCameras.find(cam => cam.deviceId === currentCameraId);
                        if (!currentCamera) {
 return 'Camera';
}

                        const label = currentCamera.label.toLowerCase();
                        const cameraType = label.includes('wide')
? 'Wide-angle lens'
                                          : label.includes('standard')
? 'Standard lens'
                                          : label.includes('main') ? 'Main camera' : 'Back camera';

                        return `${cameraType}${availableCameras.length > 1 ? ' • Tap to switch' : ''}`;
                      })()}
                    </div>
                  )}
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
