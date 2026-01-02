/**
 * S3 Image Storage Service
 *
 * Manages temporary image storage in S3 with presigned URLs
 *
 * Bucket: clinicpro-medtech-sessions
 * Region: ap-southeast-2 (Sydney)
 * Lifecycle: 1-day retention (auto-cleanup)
 *
 * S3 Key Format: sessions/{encounterId}/{timestamp}_{imageId}.jpg
 */

import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { retry } from 'ts-retry-promise';

import type { PresignedDownloadResult, PresignedUploadResult } from './types';

const PRESIGNED_UPLOAD_EXPIRY = 300; // 5 minutes
const PRESIGNED_DOWNLOAD_EXPIRY = 3600; // 1 hour

export class S3ImageService {
  private s3: S3Client;
  private bucketName: string;
  private region: string;

  constructor() {
    this.region = process.env.AWS_REGION || 'ap-southeast-2';
    this.bucketName = process.env.S3_BUCKET_NAME || 'clinicpro-medtech-sessions';

    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  /**
   * Generate S3 key for image
   */
  private generateS3Key(encounterId: string, imageId: string): string {
    const timestamp = Date.now();
    return `sessions/${encounterId}/${timestamp}_${imageId}.jpg`;
  }

  /**
   * Generate presigned URL for upload (PUT)
   *
   * Auto-retry: 3 attempts with exponential backoff
   */
  async generatePresignedUploadUrl(
    encounterId: string,
    imageId: string,
    contentType = 'image/jpeg',
  ): Promise<PresignedUploadResult> {
    const s3Key = this.generateS3Key(encounterId, imageId);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      ContentType: contentType,
    });

    // Auto-retry on failure (network issues, transient errors)
    const uploadUrl = await retry(
      async () => {
        return await getSignedUrl(this.s3, command, {
          expiresIn: PRESIGNED_UPLOAD_EXPIRY,
        });
      },
      {
        retries: 3,
        delay: 1000, // 1 second initial delay
        backoff: 'EXPONENTIAL', // 1s, 2s, 4s
        logger: (msg) => {
          console.warn('[S3] Retry:', msg);
        },
      },
    );

    return {
      uploadUrl,
      s3Key,
      expiresAt: Date.now() + PRESIGNED_UPLOAD_EXPIRY * 1000,
    };
  }

  /**
   * Generate presigned URL for download (GET)
   *
   * Auto-retry: 3 attempts with exponential backoff
   */
  async generatePresignedDownloadUrl(s3Key: string): Promise<PresignedDownloadResult> {
    // Use GetObjectCommand for downloads
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    });

    // Auto-retry on failure
    const downloadUrl = await retry(
      async () => {
        return await getSignedUrl(this.s3, command, {
          expiresIn: PRESIGNED_DOWNLOAD_EXPIRY,
        });
      },
      {
        retries: 3,
        delay: 1000,
        backoff: 'EXPONENTIAL',
        logger: (msg) => {
          console.warn('[S3] Retry:', msg);
        },
      },
    );

    return {
      downloadUrl,
      expiresAt: Date.now() + PRESIGNED_DOWNLOAD_EXPIRY * 1000,
    };
  }

  /**
   * Generate download URLs for multiple images (batch)
   */
  async generatePresignedDownloadUrls(
    s3Keys: string[],
  ): Promise<Map<string, PresignedDownloadResult>> {
    const results = new Map<string, PresignedDownloadResult>();

    // Generate in parallel
    await Promise.all(
      s3Keys.map(async (s3Key) => {
        try {
          const result = await this.generatePresignedDownloadUrl(s3Key);
          results.set(s3Key, result);
        }
        catch (error) {
          console.error('[S3] Failed to generate download URL:', s3Key, error);
          // Skip failed URLs (will be handled by caller)
        }
      }),
    );

    return results;
  }

  /**
   * Check if presigned URL is expired
   */
  isUrlExpired(expiresAt: number): boolean {
    return Date.now() >= expiresAt;
  }

  /**
   * Get S3 bucket URL for image (public URL if bucket public, otherwise presigned)
   */
  getPublicUrl(s3Key: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${s3Key}`;
  }
}

// Singleton instance
export const s3ImageService = new S3ImageService();
