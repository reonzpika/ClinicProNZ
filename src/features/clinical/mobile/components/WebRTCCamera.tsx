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
 * - Limited to 2 WIDEST lenses only (ultra-wide & wide-angle prioritized)
 * - CAPABILITY TESTING: Tests actual camera resolution/specs (not just labels)
 * - Huawei P30 Pro support: Special handling for multi-lens Huawei devices
 * - Advanced lens scoring with manufacturer-specific patterns
 * - No video mirroring to preserve clinical orientation (left/right accuracy)
 * - Progressive constraint fallback for device compatibility
 * - Video-only stream (no audio) for optimal performance
 * - High resolution capture with mobile optimization
 * - Multilingual camera label detection (Chinese, German, Spanish, French)
 * - Enhanced debugging and intelligent camera selection
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
  type CameraWithCapabilities = MediaDeviceInfo & {
    capabilities?: {
      resolution: { width: number; height: number };
      aspectRatio: number;
      estimatedFocalLength: 'ultra-wide' | 'wide' | 'standard' | 'telephoto' | 'unknown';
    };
    enhancedScore?: number;
  };

  const [availableCameras, setAvailableCameras] = useState<CameraWithCapabilities[]>([]);
  const [currentCameraId, setCurrentCameraId] = useState<string | null>(null);
  const [showCaptureFlash, setShowCaptureFlash] = useState(false);
  const [showCapturedPreview, setShowCapturedPreview] = useState(false);

  // Camera capability testing for accurate lens identification
  const testCameraCapabilities = async (deviceId: string): Promise<{
    resolution: { width: number; height: number };
    aspectRatio: number;
    estimatedFocalLength: 'ultra-wide' | 'wide' | 'standard' | 'telephoto' | 'unknown';
  }> => {
    try {
      const testConstraints = {
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(testConstraints);
      const track = stream.getVideoTracks()[0];
      if (!track) {
        throw new Error('No video track available');
      }
      const settings = track.getSettings();

      // Clean up immediately
      stream.getTracks().forEach(t => t.stop());

      const width = settings.width || 1920;
      const height = settings.height || 1080;
      const aspectRatio = width / height;

      // Enhanced lens type estimation with device-specific patterns
      let estimatedFocalLength: 'ultra-wide' | 'wide' | 'standard' | 'telephoto' | 'unknown' = 'unknown';

      // Huawei P30 Pro specific patterns (based on known specs):
      // - Main (40MP): Often supports 4K, high resolution capability
      // - Ultra-wide (20MP): Medium resolution, specific aspect ratios
      // - Telephoto (8MP): Lower resolution, limited to 1080p typically

      if (width >= 3840 || height >= 2160) {
        // 4K capability usually indicates main camera (40MP sensor)
        estimatedFocalLength = 'wide';
      } else if (width >= 2560 && height >= 1920) {
        // High resolution but not 4K - could be ultra-wide (20MP)
        estimatedFocalLength = 'ultra-wide';
      } else if (width <= 1920 && height <= 1080) {
        // Limited to 1080p - likely telephoto (8MP)
        // But also check aspect ratio to differentiate from ultra-wide cropped
        if (aspectRatio >= 1.7 && aspectRatio <= 1.8) {
          estimatedFocalLength = 'telephoto';
        } else {
          estimatedFocalLength = 'ultra-wide'; // Ultra-wide cropped to 1080p
        }
      } else {
        // Standard resolution range
        estimatedFocalLength = 'standard';
      }

      // Additional heuristics based on common patterns:
      // - Very wide aspect ratios (>1.9) often indicate ultra-wide
      // - Square-ish ratios (<1.5) might indicate cropped sensors
      if (aspectRatio > 1.9) {
        estimatedFocalLength = 'ultra-wide';
      } else if (aspectRatio < 1.5) {
        estimatedFocalLength = 'standard'; // Possibly cropped main sensor
      }

      console.log(`🔍 Camera ${deviceId} test: ${width}x${height}, ratio: ${aspectRatio.toFixed(2)}, estimated: ${estimatedFocalLength}`);

      return {
        resolution: { width, height },
        aspectRatio,
        estimatedFocalLength,
      };
    } catch (error) {
      console.warn(`⚠️ Failed to test camera ${deviceId}:`, error);
      return {
        resolution: { width: 1920, height: 1080 },
        aspectRatio: 1.78,
        estimatedFocalLength: 'unknown',
      };
    }
  };

  // Calculate lens "wideness" score for prioritizing widest lenses
  const getLensWidenessScore = (label: string): number => {
    const lowerLabel = label.toLowerCase();

    // Ultra-wide gets highest priority (100+)
    if (lowerLabel.includes('ultra-wide') || lowerLabel.includes('ultrawide')) {
 return 100;
}
    if (lowerLabel.includes('ultra wide')) {
 return 100;
}
    if (lowerLabel.includes('超广角') || lowerLabel.includes('ultra')) {
 return 100;
} // Chinese + generic ultra

    // Explicit wide-angle lenses (80-95)
    if (lowerLabel.includes('wide-angle') || lowerLabel.includes('wide angle')) {
 return 90;
}
    if (lowerLabel.includes('wide') && !lowerLabel.includes('ultra')) {
 return 80;
}
    if (lowerLabel.includes('广角')) {
 return 85;
} // Chinese wide-angle

    // Manufacturer-specific patterns (75-95)
    if (lowerLabel.includes('environment facing')) {
 return 85;
} // Samsung
    if (lowerLabel.includes('rear ultra wide') || lowerLabel.includes('back ultra wide')) {
 return 95;
}
    if (lowerLabel.includes('weitwinkel') || lowerLabel.includes('gran angular')) {
 return 85;
} // German/Spanish

    // Huawei-specific patterns (critical for P30 Pro and similar devices)
    if (lowerLabel.includes('huawei') || lowerLabel.includes('华为')) {
      // Huawei devices often have confusing labels, use position heuristics
      if (lowerLabel.includes('0') || lowerLabel.includes('first')) {
 return 60;
} // Often main camera
      if (lowerLabel.includes('1') || lowerLabel.includes('second')) {
 return 90;
} // Often ultra-wide
      if (lowerLabel.includes('2') || lowerLabel.includes('third')) {
 return 20;
} // Often telephoto
    }

    // Generic multi-camera device patterns for unknown manufacturers
    if (lowerLabel.includes('camera') && lowerLabel.match(/\d/)) {
      const numbers = lowerLabel.match(/\d+/g);
      if (numbers) {
        const cameraNumber = Number.parseInt(numbers[0]);
        // Common multi-camera patterns: 0=main, 1=ultra-wide, 2=telephoto
        switch (cameraNumber) {
          case 0: return 50; // Usually main camera
          case 1: return 85; // Usually ultra-wide or wide
          case 2: return 15; // Usually telephoto (avoid)
          default: return 20;
        }
      }
    }

    // Field of view indicators (80-95)
    if (lowerLabel.includes('0.5x') || lowerLabel.includes('0.6x')) {
 return 95;
} // Ultra-wide multiplier
    if (lowerLabel.includes('13mm') || lowerLabel.includes('14mm') || lowerLabel.includes('15mm')) {
 return 90;
} // Wide focal lengths
    if (lowerLabel.includes('16mm') || lowerLabel.includes('17mm') || lowerLabel.includes('18mm')) {
 return 85;
}
    if (lowerLabel.includes('19mm') || lowerLabel.includes('20mm') || lowerLabel.includes('21mm')) {
 return 80;
}

    // Standard/main cameras (40-50)
    if (lowerLabel.includes('standard') || lowerLabel.includes('标准')) {
 return 50;
} // English + Chinese
    if (lowerLabel.includes('main') && !lowerLabel.includes('tele')) {
 return 45;
}
    if (lowerLabel.includes('主摄') || lowerLabel.includes('主镜头')) {
 return 45;
} // Chinese main camera

    // Generic back cameras (25-35)
    if (lowerLabel.includes('back') && !lowerLabel.includes('tele')) {
 return 30;
}
    if (lowerLabel.includes('rear') && !lowerLabel.includes('tele')) {
 return 30;
}
    if (lowerLabel.includes('后置') || lowerLabel.includes('环境')) {
 return 30;
} // Chinese rear/environment

    // Position-based heuristics for generic labels (15-25)
    // First camera (camera 0) often main, second (camera 1) often wide
    if (lowerLabel.includes('camera 1') || lowerLabel.includes('camera1')) {
 return 25;
} // Often wide on multi-camera
    if (lowerLabel.includes('camera 0') || lowerLabel.includes('camera0')) {
 return 20;
} // Often main camera

    // Default score for unspecified cameras (if not front-facing)
    return 15;
  };

  // Enhanced scoring with capability testing for problematic devices
  const getEnhancedLensScore = (label: string, capabilities?: {
    estimatedFocalLength: 'ultra-wide' | 'wide' | 'standard' | 'telephoto' | 'unknown';
    resolution: { width: number; height: number };
  }): number => {
    const baseScore = getLensWidenessScore(label);

    // If we have capability data, prioritize it over label detection
    if (capabilities) {
      const { estimatedFocalLength, resolution } = capabilities;

      switch (estimatedFocalLength) {
        case 'ultra-wide':
          return 100; // Highest priority for ultra-wide
        case 'wide':
          return 85; // High priority for main wide camera
        case 'standard':
          return 60; // Medium priority for standard
        case 'telephoto':
          return 10; // Very low priority - we want to avoid telephoto
        case 'unknown':
          // Fall back to label-based scoring but boost if high resolution
          return resolution.width >= 3000 ? baseScore + 20 : baseScore;
      }
    }

    return baseScore;
  };

  // Enumerate available cameras
  const enumerateCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');

      // Filter for back-facing cameras only, exclude telephoto/zoom
      const backCameras = videoDevices.filter((device) => {
        const label = device.label.toLowerCase();

        // Exclude front-facing cameras (multilingual)
        if (label.includes('front') || label.includes('selfie') || label.includes('user')
          || label.includes('前置') || label.includes('前面') // Chinese
          || label.includes('frontal') || label.includes('vorder') // Spanish/German
          || label.includes('avant') || label.includes('facial')) { // French/general
          return false;
        }

        // Exclude telephoto/zoom lenses (anything that narrows field of view)
        if (label.includes('tele') || label.includes('zoom')
          || label.includes('3x') || label.includes('5x') || label.includes('10x')
          || label.includes('telephoto') || label.includes('periscope')
          || label.includes('长焦') || label.includes('远摄') // Chinese telephoto
          || label.includes('macro') || label.includes('微距')) { // Macro too close-up
          return false;
        }

        // Include back-facing cameras that could be wide
        return true;
      });

      // Detect device type for specialized handling
      const isHuaweiDevice = navigator.userAgent.includes('Huawei')
        || navigator.userAgent.includes('HUAWEI')
        || videoDevices.some(d => d.label.toLowerCase().includes('huawei'));

      console.log('🎥 WebRTC Camera Analysis:');
      console.log(`📱 Total video devices found: ${videoDevices.length}`);
      console.log(`🔙 Back-facing cameras after filtering: ${backCameras.length}`);
      if (isHuaweiDevice) {
        console.log('🔍 HUAWEI device detected - using enhanced capability testing');
      }

      // Test capabilities for each back camera (especially important for Huawei/multi-lens devices)
      const camerasWithCapabilities = await Promise.all(
        backCameras.map(async (camera) => {
          console.log(`🔍 Testing capabilities for: ${camera.label}`);
          const capabilities = await testCameraCapabilities(camera.deviceId);
          const enhancedScore = getEnhancedLensScore(camera.label, capabilities);

          return {
            ...camera,
            capabilities,
            enhancedScore,
          };
        }),
      );

      // Sort by enhanced score (capability-tested + label-based)
      const sortedByCapabilities = camerasWithCapabilities.sort((a, b) => {
        return b.enhancedScore - a.enhancedScore; // Descending order (best first)
      });

      // Take only the 2 widest lenses based on actual testing
      const twoWidestCameras = sortedByCapabilities.slice(0, 2);

      console.log('📊 Camera Capability Analysis Results:');
      sortedByCapabilities.forEach((camera, index) => {
        const selected = index < 2 ? '✅ SELECTED' : '❌ filtered out';
        const caps = camera.capabilities;
        const type = caps.estimatedFocalLength.toUpperCase();
        console.log(`${index + 1}. [${type}] ${camera.label}`);
        console.log(`   📏 Resolution: ${caps.resolution.width}x${caps.resolution.height}`);
        console.log(`   📐 Aspect Ratio: ${caps.aspectRatio.toFixed(2)}`);
        console.log(`   ⭐ Enhanced Score: ${camera.enhancedScore} ${selected}`);
      });

      // Enhanced fallback logic with capability awareness
      let finalCameras: CameraWithCapabilities[] = twoWidestCameras;

      if (twoWidestCameras.length === 0) {
        console.warn('⚠️ No cameras passed capability testing. Attempting fallback...');

        if (sortedByCapabilities.length > 0) {
          // Use best available camera even if score is low
          finalCameras = [sortedByCapabilities[0]!];
          console.log(`🔄 Fallback: Using highest capability-scored camera: ${sortedByCapabilities[0]!.label}`);
        } else if (backCameras.length > 0) {
          // Last resort: use any back camera without capability testing
          const fallbackCamera: CameraWithCapabilities = {
            ...backCameras[0]!,
            capabilities: undefined,
            enhancedScore: undefined,
          };
          finalCameras = [fallbackCamera];
          console.log(`🚨 Emergency fallback: Using first back camera: ${backCameras[0]!.label}`);
        } else {
          // Ultimate fallback: use any non-front camera
          const nonFrontCameras = videoDevices.filter(device =>
            !device.label.toLowerCase().includes('front')
            && !device.label.toLowerCase().includes('user')
            && !device.label.toLowerCase().includes('selfie'),
          );
          if (nonFrontCameras.length > 0) {
            const fallbackCamera: CameraWithCapabilities = {
              ...nonFrontCameras[0]!,
              capabilities: undefined,
              enhancedScore: undefined,
            };
            finalCameras = [fallbackCamera];
            console.log(`🆘 Last resort: Using first non-front camera: ${nonFrontCameras[0]!.label}`);
          }
        }
      } else if (twoWidestCameras.length === 1) {
        const camera = twoWidestCameras[0]!;
        const cameraType = camera.capabilities ? camera.capabilities.estimatedFocalLength.toUpperCase() : 'UNKNOWN';
        console.log(`📷 Single camera mode: [${cameraType}] ${camera.label}`);
      } else {
        const cam1 = twoWidestCameras[0]!;
        const cam2 = twoWidestCameras[1]!;
        const cam1Type = cam1.capabilities ? cam1.capabilities.estimatedFocalLength.toUpperCase() : 'UNKNOWN';
        const cam2Type = cam2.capabilities ? cam2.capabilities.estimatedFocalLength.toUpperCase() : 'UNKNOWN';
        console.log(`🎯 Perfect! 2 cameras selected for optimal clinical imaging:`);
        console.log(`   1️⃣ [${cam1Type}] ${cam1.label}`);
        console.log(`   2️⃣ [${cam2Type}] ${cam2.label}`);
      }

      setAvailableCameras(finalCameras);

      // Set the best available camera as default
      if (finalCameras.length > 0 && !currentCameraId) {
        setCurrentCameraId(finalCameras[0]!.deviceId);
        const defaultCamera = finalCameras[0]!;
        const cameraInfo = defaultCamera.capabilities
          ? `[${defaultCamera.capabilities.estimatedFocalLength.toUpperCase()}] ${defaultCamera.label}`
          : defaultCamera.label;
        console.log(`🔧 Default camera set: ${cameraInfo}`);
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

      // Try advanced constraints first, fallback to basic for older devices
      const highQualityConstraints: MediaStreamConstraints = {
        video: {
          ...(deviceId
            ? { deviceId: { exact: deviceId } }
            : {
                facingMode: { ideal: 'environment' },
                // Advanced constraints for modern devices
                advanced: [
                  { facingMode: 'environment' },
                  { width: { min: 1280 } },
                  { height: { min: 720 } },
                ],
              }),
          // High resolution for clinical detail
          width: { ideal: 1920, max: 4096 },
          height: { ideal: 1080, max: 2160 },
          frameRate: { ideal: 30, max: 60 },
          aspectRatio: { ideal: 16 / 9 },
        },
        audio: false,
      };

      // Basic constraints for compatibility
      const basicConstraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: { ideal: 'environment' } },
        audio: false,
      };

      let stream: MediaStream;

      try {
        // Try high-quality constraints first
        stream = await navigator.mediaDevices.getUserMedia(highQualityConstraints);
        console.log('📹 Using high-quality camera constraints');
      } catch (highQualityError) {
        console.warn('⚠️ High-quality constraints failed, trying basic constraints:', highQualityError);
        try {
          // Fallback to basic constraints
          stream = await navigator.mediaDevices.getUserMedia(basicConstraints);
          console.log('📱 Using basic camera constraints for compatibility');
        } catch (basicError) {
          // If even basic constraints fail, throw the original error
          throw basicError;
        }
      }

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

  // Switch between the 2 widest available cameras
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

        // Provide user feedback about camera type (use capability data if available)
        const cameraType = nextCamera.capabilities
          ? nextCamera.capabilities.estimatedFocalLength.replace('-', ' ')
          : (() => {
              const wideness = getLensWidenessScore(nextCamera.label);
              return wideness >= 90
? 'Ultra-wide'
                   : wideness >= 80
? 'Wide-angle'
                   : wideness >= 50
? 'Standard'
                   : wideness >= 40 ? 'Main' : 'Back';
            })();

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

                        const cameraType = currentCamera.capabilities
                          ? `${currentCamera.capabilities.estimatedFocalLength.replace('-', ' ')} lens`
                          : (() => {
                              const wideness = getLensWidenessScore(currentCamera.label);
                              return wideness >= 90
? 'Ultra-wide lens'
                                   : wideness >= 80
? 'Wide-angle lens'
                                   : wideness >= 50
? 'Standard lens'
                                   : wideness >= 40 ? 'Main camera' : 'Back camera';
                            })();

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
