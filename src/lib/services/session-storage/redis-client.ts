/**
 * Redis Session Storage Service
 *
 * Manages per-encounter image sessions using Upstash Redis
 *
 * Session Keys:
 * - encounter:{encounterId} → EncounterSession
 * - session-token:{token} → SessionToken
 *
 * TTL: 2 hours (7200 seconds)
 */

import { Redis } from '@upstash/redis';

import type { EncounterSession, SessionImage, SessionToken } from './types';

const SESSION_TTL = 7200; // 2 hours in seconds
const TOKEN_TTL = 600; // 10 minutes in seconds

export class RedisSessionService {
  private redis: Redis;

  constructor() {
    // Initialize Upstash Redis from environment variables
    this.redis = Redis.fromEnv();
  }

  /**
   * Create a new encounter session (or return existing)
   */
  async createSession(
    encounterId: string,
    patientId: string,
    facilityId: string,
  ): Promise<EncounterSession> {
    // Check if session already exists
    const existingSession = await this.getSession(encounterId);

    if (existingSession) {
      // Session exists - refresh TTL and update lastActivity
      existingSession.lastActivity = Date.now();
      await this.redis.setex(
        `encounter:${encounterId}`,
        SESSION_TTL,
        JSON.stringify(existingSession),
      );
      return existingSession;
    }

    // Create new session
    const now = Date.now();

    const session: EncounterSession = {
      encounterId,
      patientId,
      facilityId,
      images: [],
      createdAt: now,
      lastActivity: now,
    };

    // Store with 2-hour TTL
    await this.redis.setex(
      `encounter:${encounterId}`,
      SESSION_TTL,
      JSON.stringify(session),
    );

    return session;
  }

  /**
   * Get encounter session (returns null if expired or not found)
   */
  async getSession(encounterId: string): Promise<EncounterSession | null> {
    const data = await this.redis.get<string>(`encounter:${encounterId}`);

    if (!data) {
      return null;
    }

    // Redis returns string, parse to object
    return typeof data === 'string' ? JSON.parse(data) : data;
  }

  /**
   * Add image to session
   */
  async addImage(
    encounterId: string,
    image: SessionImage,
  ): Promise<EncounterSession> {
    const session = await this.getSession(encounterId);

    if (!session) {
      throw new Error(`Session not found for encounter: ${encounterId}`);
    }

    // Add image to array
    session.images.push(image);
    session.lastActivity = Date.now();

    // Update session with refreshed TTL
    await this.redis.setex(
      `encounter:${encounterId}`,
      SESSION_TTL,
      JSON.stringify(session),
    );

    return session;
  }

  /**
   * Get all images for encounter
   */
  async getImages(encounterId: string): Promise<SessionImage[]> {
    const session = await this.getSession(encounterId);
    return session?.images || [];
  }

  /**
   * Delete session (cleanup)
   */
  async deleteSession(encounterId: string): Promise<void> {
    await this.redis.del(`encounter:${encounterId}`);
  }

  /**
   * Create session token for QR code (short-lived)
   */
  async createSessionToken(
    token: string,
    encounterId: string,
    patientId: string,
    facilityId: string,
  ): Promise<void> {
    const tokenData: SessionToken = {
      encounterId,
      patientId,
      facilityId,
      createdAt: Date.now(),
    };

    // Store with 10-minute TTL
    await this.redis.setex(
      `session-token:${token}`,
      TOKEN_TTL,
      JSON.stringify(tokenData),
    );
  }

  /**
   * Get session token data (returns null if expired)
   */
  async getSessionToken(token: string): Promise<SessionToken | null> {
    const data = await this.redis.get<string>(`session-token:${token}`);

    if (!data) {
      return null;
    }

    return typeof data === 'string' ? JSON.parse(data) : data;
  }

  /**
   * Update session activity timestamp (keeps session alive)
   */
  async touchSession(encounterId: string): Promise<void> {
    const session = await this.getSession(encounterId);

    if (!session) {
      return;
    }

    session.lastActivity = Date.now();

    // Refresh TTL
    await this.redis.setex(
      `encounter:${encounterId}`,
      SESSION_TTL,
      JSON.stringify(session),
    );
  }
}

// Singleton instance
export const redisSessionService = new RedisSessionService();
