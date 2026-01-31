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
 * - "right-wound-infection-2026-01-31-143052123.jpg"
 * - "left-ulcer-2026-01-31-091523456.jpg"
 * - "clinical-photo-2026-01-31-143052123.jpg" (no metadata)
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

  // Parse date and time from createdAt (ISO string)
  const timestamp = typeof image.createdAt === 'string'
    ? image.createdAt
    : image.createdAt.toISOString();
  const [datePart, timePart] = timestamp.split('T');
  const date = datePart ?? '';
  // HHmmssSSS for uniqueness (avoids same-second collisions)
  const time = timePart
    ? timePart.replace(/[^0-9]/g, '').substring(0, 9)
    : '000000000';
  const timeCompact = time.length >= 9 ? time : time.padEnd(9, '0');

  parts.push(date);
  parts.push(timeCompact);

  // Fallback if no metadata (only date + time)
  if (parts.length === 2) {
    return `clinical-photo-${date}-${timeCompact}.jpg`;
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
