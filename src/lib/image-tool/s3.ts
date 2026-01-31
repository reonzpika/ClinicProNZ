import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { retry } from 'ts-retry-promise';

const PRESIGNED_UPLOAD_EXPIRY_SEC = 300; // 5 min
const PRESIGNED_DOWNLOAD_EXPIRY_SEC = 3600; // 1 hour

function getS3Client() {
  return new S3Client({
    region: process.env.AWS_REGION || 'ap-southeast-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

export function getImageToolBucketName(): string {
  return process.env.S3_REFERRAL_IMAGES || process.env.S3_BUCKET_NAME || 'clinicpro-medtech-sessions';
}

function extensionForContentType(contentType: string | undefined): string {
  if (!contentType) {
    return 'jpg';
  }
  if (contentType === 'application/pdf') {
    return 'pdf';
  }
  // default to jpg for all image/* uploads in this tool
  return 'jpg';
}

export function buildImageToolS3Key(args: { userId: string; imageId: string; now?: number; contentType?: string }) {
  const ts = args.now ?? Date.now();
  const ext = extensionForContentType(args.contentType);
  return `image/${args.userId}/${ts}_${args.imageId}.${ext}`;
}

export async function generateImageToolPresignedUpload(args: {
  userId: string;
  imageId: string;
  contentType?: string;
  s3Key?: string; // Optional pre-generated s3Key to avoid timestamp mismatch
}) {
  const s3 = getS3Client();
  const bucket = getImageToolBucketName();
  // Use provided s3Key or generate new one (for backwards compatibility)
  const s3Key = args.s3Key || buildImageToolS3Key({ userId: args.userId, imageId: args.imageId, contentType: args.contentType });

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: s3Key,
    ContentType: args.contentType || 'image/jpeg',
  });

  try {
    const uploadUrl = await retry(
      async () => {
        return await getSignedUrl(s3, command, { expiresIn: PRESIGNED_UPLOAD_EXPIRY_SEC });
      },
      { retries: 3, delay: 600, backoff: 'EXPONENTIAL' },
    );

    return {
      uploadUrl,
      s3Key,
      expiresAt: Date.now() + PRESIGNED_UPLOAD_EXPIRY_SEC * 1000,
    };
  } catch (error: any) {
    throw error;
  }
}

export async function generateImageToolPresignedDownload(s3Key: string) {
  const s3 = getS3Client();
  const bucket = getImageToolBucketName();
  const command = new GetObjectCommand({ Bucket: bucket, Key: s3Key });

  const downloadUrl = await retry(
    async () => {
      return await getSignedUrl(s3, command, { expiresIn: PRESIGNED_DOWNLOAD_EXPIRY_SEC });
    },
    { retries: 3, delay: 600, backoff: 'EXPONENTIAL' },
  );

  return {
    downloadUrl,
    expiresIn: PRESIGNED_DOWNLOAD_EXPIRY_SEC,
    expiresAt: Date.now() + PRESIGNED_DOWNLOAD_EXPIRY_SEC * 1000,
  };
}

/**
 * Get an object from the image-tool S3 bucket as a Buffer.
 * Used for server-side operations (e.g. rotate) that need the image bytes.
 */
export async function getImageToolObject(s3Key: string): Promise<Buffer> {
  const s3 = getS3Client();
  const bucket = getImageToolBucketName();
  const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: s3Key }));
  const body = response.Body;
  if (!body) {
    throw new Error(`Empty body for key: ${s3Key}`);
  }
  const chunks: Uint8Array[] = [];
  for await (const chunk of body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Put a buffer into the image-tool S3 bucket (overwrites existing object).
 * Used after rotating an image in-place.
 */
export async function putImageToolObject(s3Key: string, body: Buffer, contentType = 'image/jpeg'): Promise<void> {
  const s3 = getS3Client();
  const bucket = getImageToolBucketName();
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      Body: body,
      ContentType: contentType,
    })
  );
}

/**
 * Delete an object from the image-tool S3 bucket.
 * Used when a user deletes an image from the desktop gallery.
 */
export async function deleteImageToolObject(s3Key: string): Promise<void> {
  const s3 = getS3Client();
  const bucket = getImageToolBucketName();
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: s3Key }));
  } catch (error) {
    console.error('[image-tool/s3] deleteImageToolObject failed:', s3Key, error);
    throw error;
  }
}
