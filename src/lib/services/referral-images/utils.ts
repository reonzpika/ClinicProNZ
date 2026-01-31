/**
 * Utility functions for GP Referral Images
 */

export interface ImageMetadata {
  side?: 'R' | 'L';
  description?: string;
}

export interface ImageWithMetadata {
  imageId: string;
  side?: string;
  description?: string;
  createdAt: Date | string;
}

/**
 * Generate meaningful filename from image metadata
 *
 * Examples:
 * - "right-wound-infection-2026-01-29-a3f9e2.jpg"
 * - "left-ulcer-2026-01-29-b7c4d1.jpg"
 * - "clinical-photo-2026-01-29-e8f2a9.jpg" (no metadata)
 */
export function generateFilename(image: ImageWithMetadata): string {
  const parts: string[] = [];

  // Add side if present
  if (image.side) {
    parts.push(image.side === 'R' ? 'right' : 'left');
  }

  // Add description if present (sanitized, truncated to 30 chars)
  if (image.description) {
    const sanitized = image.description
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
    if (sanitized) {
      parts.push(sanitized);
    }
  }

  // Add date for uniqueness
  const timestamp = typeof image.createdAt === 'string'
    ? image.createdAt
    : image.createdAt.toISOString();
  const date = timestamp.split('T')[0] ?? '';
  parts.push(date);

  // Add short ID to prevent conflicts
  parts.push(image.imageId.substring(0, 6));

  // Fallback if no metadata (only date + ID)
  if (parts.length === 2) {
    return `clinical-photo-${date}-${image.imageId.substring(0, 6)}.jpg`;
  }

  return `${parts.join('-')}.jpg`;
}

/**
 * Calculate current month limit for user
 *
 * @param tier - User tier ('free' or 'premium')
 * @param accountCreatedMonth - Month when account was created (YYYY-MM)
 * @param currentMonth - Current month (YYYY-MM)
 * @param graceUnlocksUsed - Number of grace unlocks used this month (0-2)
 * @returns Image limit for the current month
 */
export function calculateLimit(
  tier: string,
  accountCreatedMonth: string,
  currentMonth: string,
  graceUnlocksUsed: number,
): number {
  // Premium users: unlimited
  if (tier === 'premium') {
    return 999999;
  }

  // Month 1 (signup month): unlimited
  if (accountCreatedMonth === currentMonth) {
    return 999999;
  }

  // Month 2+: 10 base + (grace unlocks * 10)
  return 10 + (graceUnlocksUsed * 10);
}

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get month from date string in YYYY-MM format
 */
export function getMonthFromDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Calculate expiry date (24 hours from now)
 */
export function calculateExpiryDate(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  return expiry;
}

/**
 * Check if limit is reached
 */
export function isLimitReached(imageCount: number, limit: number): boolean {
  return imageCount >= limit;
}

/**
 * Check if user can use grace unlock
 */
export function canUseGraceUnlock(graceUnlocksUsed: number): boolean {
  return graceUnlocksUsed < 2;
}
