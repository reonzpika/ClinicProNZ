import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { imageToolUploads } from '@/db/schema';
import { generateFilename } from '@/src/lib/services/referral-images/utils';
import { getDb } from 'database/client';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{
    imageId: string;
  }>;
}

/**
 * GET /api/referral-images/download/[imageId]
 *
 * Download single image with metadata-based filename
 *
 * Response: Redirects to presigned S3 URL with Content-Disposition header
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { imageId } = await params;

  try {
    const db = getDb();

    // Get image metadata
    const imageRow = await db
      .select({
        s3Key: imageToolUploads.s3Key,
        side: imageToolUploads.side,
        description: imageToolUploads.description,
        createdAt: imageToolUploads.createdAt,
        imageId: imageToolUploads.imageId,
      })
      .from(imageToolUploads)
      .where(eq(imageToolUploads.imageId, imageId))
      .limit(1);

    if (!imageRow.length) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    const image = imageRow[0];

    // Generate meaningful filename
    const filename = generateFilename({
      imageId: image.imageId,
      side: image.side || undefined,
      description: image.description || undefined,
      createdAt: image.createdAt,
    });

    // Generate presigned URL with custom filename
    const s3 = new S3Client({
      region: process.env.AWS_REGION || 'ap-southeast-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const bucket = process.env.S3_IMAGE_TOOL_BUCKET_NAME || 'clinicpro-medtech-sessions';

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: image.s3Key,
      ResponseContentDisposition: `attachment; filename="${filename}"`,
    });

    const downloadUrl = await getSignedUrl(s3, command, {
      expiresIn: 3600, // 1 hour
    });

    // Redirect to presigned URL
    return NextResponse.redirect(downloadUrl);
  } catch (error) {
    console.error('[referral-images/download] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}
