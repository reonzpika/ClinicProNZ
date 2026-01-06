/**
 * Session Storage Types
 *
 * Redis schema for per-encounter image sessions
 */

export interface SessionImage {
  /** S3 key for the image */
  s3Key: string;

  /** Image metadata captured on mobile */
  metadata?: {
    laterality?: {
      code: 'left' | 'right' | 'bilateral' | 'na';
      display: string;
    };
    bodySite?: {
      code: string;
      display: string;
    };
    notes?: string;
  };

  /** When image was uploaded */
  uploadedAt: number;
}

export interface EncounterSession {
  /** Encounter ID from Medtech */
  encounterId: string;

  /** Patient ID from Medtech */
  patientId: string;

  /** Patient name (for display on mobile) */
  patientName?: string;

  /** Patient NHI (for display on mobile) */
  patientNHI?: string;

  /** Facility ID */
  facilityId: string;

  /** Images uploaded to this session */
  images: SessionImage[];

  /** Session creation timestamp */
  createdAt: number;

  /** Last activity timestamp (for TTL refresh) */
  lastActivity: number;
}

export interface SessionToken {
  /** Encounter ID this token is for */
  encounterId: string;

  /** Patient ID */
  patientId: string;

  /** Patient name (for display on mobile) */
  patientName?: string;

  /** Patient NHI (for display on mobile) */
  patientNHI?: string;

  /** Facility ID */
  facilityId: string;

  /** When token was created */
  createdAt: number;
}

export interface PresignedUploadResult {
  /** Presigned PUT URL for S3 upload */
  uploadUrl: string;

  /** S3 key where image will be stored */
  s3Key: string;

  /** Expiry time (5 minutes from now) */
  expiresAt: number;
}

export interface PresignedDownloadResult {
  /** Presigned GET URL for S3 download */
  downloadUrl: string;

  /** Expiry time (1 hour from now) */
  expiresAt: number;
}
