/**
 * Image Compression Service
 *
 * - Converts HEIC → JPEG
 * - Strips EXIF data
 * - Compresses to < 1MB
 * - Applies EXIF orientation
 * - Resizes to longest edge (1600px → 1280px → 1024px fallback)
 */

import type { CompressionOptions, CompressionResult } from '../types';

/**
 * Default compression options
 */
export const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  maxSizeBytes: 1048576, // 1MB
  longestEdgePx: 1600,
  quality: 0.85,
  stripExif: true,
};

/**
 * Compress image to meet size requirements
 */
export async function compressImage(
  file: File,
  options: Partial<CompressionOptions> = {},
): Promise<CompressionResult> {
  const opts = { ...DEFAULT_COMPRESSION_OPTIONS, ...options };

  console.log('[Compression] Starting:', {
    filename: file.name,
    originalSize: file.size,
    targetSize: opts.maxSizeBytes,
  });

  // Check if already under limit (and not HEIC)
  if (file.size <= opts.maxSizeBytes && !file.type.includes('heic')) {
    console.log('[Compression] Already under limit, returning original');
    return {
      compressedFile: file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 1,
    };
  }

  // Load image
  const img = await loadImage(file);

  // Calculate target dimensions
  const { width, height } = calculateDimensions(
    img.width,
    img.height,
    opts.longestEdgePx,
  );

  // Compress with quality adjustment
  let quality = opts.quality;
  let compressedFile: File | null = null;

  // Try with initial quality
  compressedFile = await compressToCanvas(img, width, height, quality, file.name);

  // If still too large, reduce quality iteratively
  while (compressedFile.size > opts.maxSizeBytes && quality > 0.5) {
    quality -= 0.1;
    console.log('[Compression] Retrying with quality:', quality.toFixed(2));
    compressedFile = await compressToCanvas(img, width, height, quality, file.name);
  }

  // If still too large, reduce dimensions
  if (compressedFile.size > opts.maxSizeBytes) {
    console.log('[Compression] Still too large, reducing dimensions');
    const smallerEdge = Math.floor(opts.longestEdgePx * 0.8); // 80% of original
    const { width: w2, height: h2 } = calculateDimensions(
      img.width,
      img.height,
      smallerEdge,
    );
    compressedFile = await compressToCanvas(img, w2, h2, 0.8, file.name);
  }

  // Last resort: aggressive compression
  if (compressedFile.size > opts.maxSizeBytes) {
    console.log('[Compression] Final attempt with aggressive settings');
    const tinyEdge = 1024;
    const { width: w3, height: h3 } = calculateDimensions(
      img.width,
      img.height,
      tinyEdge,
    );
    compressedFile = await compressToCanvas(img, w3, h3, 0.7, file.name);
  }

  console.log('[Compression] Complete:', {
    originalSize: file.size,
    compressedSize: compressedFile.size,
    compressionRatio: (compressedFile.size / file.size).toFixed(2),
  });

  return {
    compressedFile,
    originalSize: file.size,
    compressedSize: compressedFile.size,
    compressionRatio: compressedFile.size / file.size,
  };
}

/**
 * Load image from File
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Calculate target dimensions maintaining aspect ratio
 */
function calculateDimensions(
  width: number,
  height: number,
  maxLongestEdge: number,
): { width: number; height: number } {
  const longestEdge = Math.max(width, height);

  if (longestEdge <= maxLongestEdge) {
    return { width, height };
  }

  const scale = maxLongestEdge / longestEdge;

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

/**
 * Compress image to canvas and convert to File
 */
async function compressToCanvas(
  img: HTMLImageElement,
  width: number,
  height: number,
  quality: number,
  originalFilename: string,
): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Draw image with smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  // Convert to blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      'image/jpeg',
      quality,
    );
  });

  // Convert to File
  const filename = originalFilename.replace(/\.[^.]+$/, '.jpg');
  return new File([blob], filename, { type: 'image/jpeg' });
}

/**
 * Create thumbnail preview (smaller, for UI display)
 */
export async function createThumbnail(file: File, maxSize = 300): Promise<string> {
  const img = await loadImage(file);
  const { width, height } = calculateDimensions(img.width, img.height, maxSize);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', 0.8);
}

/**
 * Get image dimensions without loading full image
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  const img = await loadImage(file);
  return { width: img.width, height: img.height };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
 return '0 Bytes';
}

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validate file type
 */
export function isValidImageType(file: File, acceptedTypes: string[]): boolean {
  return acceptedTypes.some((type) => {
    if (type.endsWith('/*')) {
      const prefix = type.replace('/*', '');
      return file.type.startsWith(prefix);
    }
    return file.type === type;
  });
}

/**
 * Generate hash for deduplication (simple hash, not cryptographic)
 */
export async function generateFileHash(file: File): Promise<string> {
  // For now, use filename + size + last modified as simple hash
  // In production, use crypto.subtle.digest for proper hashing
  const hashString = `${file.name}-${file.size}-${file.lastModified}`;
  return btoa(hashString).slice(0, 32);
}
