/**
 * Mobile Session Storage Service
 *
 * Manages mobile upload sessions in Redis
 */

import { cacheGet, cacheSet, getRedis } from '@/src/lib/cache/redis';
import { randomUUID } from 'crypto';

export type MobileSession = {
  token: string;
  encounterId: string;
  patientId: string;
  facilityId: string;
  createdAt: number; // Timestamp
  expiresAt: number; // Timestamp
  images: MobileSessionImage[];
};

export type MobileSessionImage = {
  id: string;
  fileId: string; // Temporary file ID
  uploadedAt: number; // Timestamp
  metadata?: {
    bodySite?: { system?: string; code: string; display: string };
    laterality?: { system?: string; code: string; display: string };
    view?: { system?: string; code: string; display: string };
    type?: { system?: string; code: string; display: string };
    label?: string;
  };
  contentType: string;
  sizeBytes: number;
  base64Data: string; // Base64 encoded image
};

const SESSION_PREFIX = 'medtech:mobile:session:';
const SESSION_TTL_SECONDS = 3600; // 1 hour default (session lasts until desktop closes)

/**
 * Create a new mobile session
 */
export async function createMobileSession(
  encounterId: string,
  patientId: string,
  facilityId: string,
): Promise<string> {
  const token = randomUUID();
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_SECONDS * 1000;

  const session: MobileSession = {
    token,
    encounterId,
    patientId,
    facilityId,
    createdAt: now,
    expiresAt,
    images: [],
  };

  const key = `${SESSION_PREFIX}${token}`;
  await cacheSet(key, session, SESSION_TTL_SECONDS);

  return token;
}

/**
 * Get mobile session by token
 */
export async function getMobileSession(token: string): Promise<MobileSession | null> {
  const key = `${SESSION_PREFIX}${token}`;
  const session = await cacheGet<MobileSession>(key);

  if (!session) {
    return null;
  }

  // Check if expired
  if (Date.now() >= session.expiresAt) {
    // Clean up expired session
    await deleteMobileSession(token);
    return null;
  }

  return session;
}

/**
 * Add image to session
 * Extends session TTL when adding images to keep session alive
 */
export async function addImageToSession(
  token: string,
  image: Omit<MobileSessionImage, 'id' | 'uploadedAt'>,
): Promise<string> {
  const session = await getMobileSession(token);

  if (!session) {
    throw new Error('Session not found or expired');
  }

  const imageId = randomUUID();
  const newImage: MobileSessionImage = {
    id: imageId,
    ...image,
    uploadedAt: Date.now(),
  };

  session.images.push(newImage);

  // Extend session expiration when adding images (keeps session alive)
  // Use full TTL to ensure session doesn't expire during active use
  session.expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;

  // Update session in Redis with extended TTL
  const key = `${SESSION_PREFIX}${token}`;
  await cacheSet(key, session, SESSION_TTL_SECONDS);

  return imageId;
}

/**
 * Get all images for a session
 */
export async function getSessionImages(token: string): Promise<MobileSessionImage[]> {
  const session = await getMobileSession(token);
  return session?.images || [];
}

/**
 * Delete mobile session
 */
export async function deleteMobileSession(token: string): Promise<void> {
  const key = `${SESSION_PREFIX}${token}`;
  const client = getRedis();
  if (client) {
    try {
      await client.del(key);
    } catch {
      // Ignore errors
    }
  }
}

/**
 * Extend session expiration
 */
export async function extendSession(token: string, additionalSeconds: number): Promise<void> {
  const session = await getMobileSession(token);

  if (!session) {
    throw new Error('Session not found');
  }

  session.expiresAt = Date.now() + additionalSeconds * 1000;

  const key = `${SESSION_PREFIX}${token}`;
  const newTTL = Math.floor((session.expiresAt - Date.now()) / 1000);
  if (newTTL > 0) {
    await cacheSet(key, session, newTTL);
  }
}
