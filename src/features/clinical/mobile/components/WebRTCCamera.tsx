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
  maxImageSize = 1024, // match desktop resize
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
  const [cameraCapabilities, setCameraCapabilities] = useState<Record<string, any>>({});

  // Test camera capabilities to determine field of view and specifications
  const testCameraCapabilities = useCallback(async (deviceId: string): Promise<any> => {
    try {
      // Get supported constraints for this specific camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) {
        stream.getTracks().forEach(track => track.stop());
        return null;
      }

      const capabilities = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
      const settings = videoTrack.getSettings();

      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());

      return {
        capabilities,
        settings,
        maxResolution: {
          width: capabilities.width?.max || settings.width || 0,
          height: capabilities.height?.max || settings.height || 0,
        },
        // Calculate approximate field of view indicator (wider = higher ratio)
        aspectRatio: capabilities.width?.max && capabilities.height?.max
          ? capabilities.width.max / capabilities.height.max
          : settings.width && settings.height
          ? settings.width / settings.height
          : 1.77, // Default 16:9
      };
    } catch (error) {
      console.warn(`Failed to test capabilities for camera ${deviceId}:`, error);
      return null;
    }
  }, []);

  // Enumerate available cameras and test their capabilities to find the 2 widest lenses
  const enumerateCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');

      console.log('🔍 === CAMERA DEVICE ENUMERATION ===');
      console.log(`Found ${videoDevices.length} video devices:`);

      // Log all available cameras
      videoDevices.forEach((device, index) => {
        console.log(`${index + 1}. ${device.label || `Camera ${index + 1}`} (ID: ${device.deviceId.slice(0, 12)}...)`);
      });

      // Filter for back-facing cameras only (exclude front-facing)
      const backCameras = videoDevices.filter((device) => {
        const label = device.label.toLowerCase();
        const isBackFacing = !label.includes('front')
          && !label.includes('selfie')
          && !label.includes('user')
          && !label.includes('facetime'); // Exclude FaceTime camera on iOS
        return isBackFacing;
      });

      console.log(`\n📱 Back-facing cameras found: ${backCameras.length}`);

      if (backCameras.length === 0) {
        console.warn('No back-facing cameras found. Using all available cameras.');
        setAvailableCameras(videoDevices.slice(0, 2)); // Limit to 2 even if all are front
        if (videoDevices.length > 0 && !currentCameraId) {
          setCurrentCameraId(videoDevices[0]!.deviceId);
        }
        return;
      }

      // Test capabilities of each back camera
      console.log('\n🧪 === TESTING CAMERA CAPABILITIES ===');
      const cameraTests: Array<{
        device: MediaDeviceInfo;
        capabilities: any;
        widthScore: number; // Higher = wider field of view
      }> = [];

      for (const [index, device] of backCameras.entries()) {
        console.log(`\nTesting ${index + 1}/${backCameras.length}: ${device.label || 'Unknown Camera'}`);

        const capabilities = await testCameraCapabilities(device.deviceId);
        if (capabilities) {
          // Calculate width score based on multiple factors
          const label = device.label.toLowerCase();
          let widthScore = 0;

          // Base score on maximum resolution width (higher resolution often = wider field of view)
          widthScore += capabilities.maxResolution.width * 0.001; // Scale down

          // Bonus points for lens type keywords (higher = wider)
          if (label.includes('ultra-wide') || label.includes('ultrawide')) {
 widthScore += 100;
} else if (label.includes('wide')) {
 widthScore += 50;
} else if (label.includes('main') || label.includes('primary')) {
 widthScore += 30;
} else if (label.includes('standard')) {
 widthScore += 20;
}

          // Heavy penalty for telephoto/zoom (narrower field of view)
          if (label.includes('tele') || label.includes('zoom') || label.includes('3x') || label.includes('5x')) {
            widthScore -= 100;
          }

          // Bonus for higher aspect ratio (wider field)
          widthScore += capabilities.aspectRatio * 10;

          // Additional scoring based on typical mobile camera setups
          if (label.includes('0.5x') || label.includes('0.6x')) {
 widthScore += 80;
} // Ultra-wide multipliers
          if (label.includes('1x')) {
 widthScore += 40;
} // Standard wide
          if (label.includes('2x') || label.includes('3x')) {
 widthScore -= 30;
} // Telephoto

          cameraTests.push({
            device,
            capabilities,
            widthScore,
          });

          console.log(`  • Max Resolution: ${capabilities.maxResolution.width}x${capabilities.maxResolution.height}`);
          console.log(`  • Aspect Ratio: ${capabilities.aspectRatio.toFixed(2)}`);
          console.log(`  • Width Score: ${widthScore.toFixed(1)}`);
          console.log(`  • Lens Type: ${
            label.includes('ultra-wide') || label.includes('ultrawide')
? 'Ultra-Wide'
            : label.includes('wide')
? 'Wide'
            : label.includes('main')
? 'Main'
            : label.includes('standard')
? 'Standard'
            : label.includes('tele') ? 'Telephoto' : 'Unknown'
          }`);
        } else {
          console.log(`  ❌ Failed to test capabilities`);
        }
      }

      // Sort by width score (highest first = widest field of view)
      cameraTests.sort((a, b) => b.widthScore - a.widthScore);

      // Select only the TOP 2 widest cameras
      const selectedCameras = cameraTests.slice(0, 2).map(test => test.device);

      console.log('\n🎯 === SELECTED CAMERAS (2 WIDEST LENSES) ===');
      selectedCameras.forEach((device, index) => {
        const test = cameraTests.find(t => t.device.deviceId === device.deviceId);
        console.log(`${index + 1}. ${device.label || `Camera ${index + 1}`}`);
        console.log(`   Score: ${test?.widthScore.toFixed(1)} | Resolution: ${test?.capabilities.maxResolution.width}x${test?.capabilities.maxResolution.height}`);
      });

      if (selectedCameras.length === 0) {
        console.warn('No cameras passed capability tests. Using first available back camera.');
        setAvailableCameras(backCameras.slice(0, 1));
        if (backCameras.length > 0 && !currentCameraId) {
          setCurrentCameraId(backCameras[0]!.deviceId);
        }
        return;
      }

      // Store capabilities for UI display
      const capabilitiesMap: Record<string, any> = {};
      cameraTests.forEach((test) => {
        capabilitiesMap[test.device.deviceId] = test.capabilities;
      });
      setCameraCapabilities(capabilitiesMap);

      // Set the selected cameras (only the 2 widest)
      setAvailableCameras(selectedCameras);

      // Set the first (widest) camera as default
      if (selectedCameras.length > 0 && !currentCameraId) {
        setCurrentCameraId(selectedCameras[0]!.deviceId);
        console.log(`\n✅ Default camera selected: ${selectedCameras[0]!.label}`);
      }
    } catch (err) {
      console.error('Failed to enumerate cameras:', err);
      setError('Failed to access camera devices. Please ensure camera permissions are granted.');
    }
  }, [currentCameraId, testCameraCapabilities]);

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

        // Provide user feedback about camera type with scoring
        const nextCapabilities = cameraCapabilities[nextCamera.deviceId];
        const nextLabel = nextCamera.label.toLowerCase();

        const cameraType = nextLabel.includes('ultra-wide') || nextLabel.includes('ultrawide')
? 'Ultra-Wide'
                          : nextLabel.includes('wide')
? 'Wide'
                          : nextLabel.includes('standard')
? 'Standard'
                          : nextLabel.includes('main') ? 'Main' : 'Back';

        const resolutionInfo = nextCapabilities?.maxResolution
          ? ` (${nextCapabilities.maxResolution.width}×${nextCapabilities.maxResolution.height})`
          : '';

        console.log(`🔄 Switched to ${cameraType} lens${resolutionInfo}: ${nextCamera.label}`);
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
                        const capabilities = cameraCapabilities[currentCamera.deviceId];

                        // Enhanced camera type detection
                        let cameraType = 'Back camera';
                        if (label.includes('ultra-wide') || label.includes('ultrawide')) {
                          cameraType = 'Ultra-Wide lens';
                        } else if (label.includes('wide')) {
                          cameraType = 'Wide lens';
                        } else if (label.includes('main') || label.includes('primary')) {
                          cameraType = 'Main lens';
                        } else if (label.includes('standard')) {
                          cameraType = 'Standard lens';
                        }

                        // Add resolution info if available
                        const resolutionInfo = capabilities?.maxResolution
                          ? ` (${capabilities.maxResolution.width}×${capabilities.maxResolution.height})`
                          : '';

                        const currentIndex = availableCameras.findIndex(cam => cam.deviceId === currentCameraId);
                        const switchInfo = availableCameras.length > 1
                          ? ` • ${currentIndex + 1}/${availableCameras.length} • Tap ⟲`
                          : '';

                        return `${cameraType}${resolutionInfo}${switchInfo}`;
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
