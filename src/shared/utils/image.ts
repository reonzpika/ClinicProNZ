'use client';

// Shared client-side image resize helper
// - Maintains aspect ratio
// - Caps longest edge to maxSize (default 1024px)
// - Uses original MIME type; quality 0.8 for lossy formats
export async function resizeImageFile(file: File, maxSize: number = 1024): Promise<Blob> {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const image = new Image();

      image.onload = () => {
        try {
          let targetWidth = image.width;
          let targetHeight = image.height;

          if (image.width >= image.height) {
            if (image.width > maxSize) {
              targetWidth = maxSize;
              targetHeight = Math.round((image.height * maxSize) / image.width);
            }
          } else if (image.height > maxSize) {
            targetHeight = maxSize;
            targetWidth = Math.round((image.width * maxSize) / image.height);
          }

          // If no resize needed, return original file
          if (targetWidth === image.width && targetHeight === image.height) {
            URL.revokeObjectURL(url);
            resolve(file);
            return;
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(url);
            resolve(file);
            return;
          }

          ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

          const isLossy = /image\/jpeg|image\/jpg|image\/webp/i.test(file.type);
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(url);
              resolve(blob || file);
            },
            file.type,
            isLossy ? 0.8 : undefined,
          );
        } catch {
          URL.revokeObjectURL(url);
          resolve(file);
        }
      };

      image.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };

      image.src = url;
    } catch {
      resolve(file);
    }
  });
}

