/**
 * Share prompt thresholds: 10, 20, 50, then every 50 (100, 150, 200, ...).
 * Used by desktop (after download) and capture (after upload).
 */

const DOWNLOAD_COUNT_KEY = (userId: string) => `referral_images_download_count_${userId}`;
const UPLOAD_COUNT_KEY = (userId: string) => `referral_images_upload_count_${userId}`;

export function isSharePromptThreshold(total: number): boolean {
  return total === 10 || total === 20 || (total >= 50 && total % 50 === 0);
}

export function getDownloadCount(userId: string | null): number {
  if (typeof window === 'undefined' || !userId) {
 return 0;
}
  const raw = window.localStorage.getItem(DOWNLOAD_COUNT_KEY(userId));
  const n = Number.parseInt(raw ?? '0', 10);
  return Number.isFinite(n) ? n : 0;
}

export function incrementDownloadCount(userId: string | null, by: number): number {
  if (typeof window === 'undefined' || !userId) {
 return 0;
}
  const current = getDownloadCount(userId);
  const next = current + by;
  window.localStorage.setItem(DOWNLOAD_COUNT_KEY(userId), String(next));
  return next;
}

export function getUploadCount(userId: string | null): number {
  if (typeof window === 'undefined' || !userId) {
 return 0;
}
  const raw = window.localStorage.getItem(UPLOAD_COUNT_KEY(userId));
  const n = Number.parseInt(raw ?? '0', 10);
  return Number.isFinite(n) ? n : 0;
}

export function incrementUploadCount(userId: string | null, by: number): number {
  if (typeof window === 'undefined' || !userId) {
 return 0;
}
  const current = getUploadCount(userId);
  const next = current + by;
  window.localStorage.setItem(UPLOAD_COUNT_KEY(userId), String(next));
  return next;
}
