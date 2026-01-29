import Ably from 'ably';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

import { imageToolUploads, imageToolUsage, users } from '@/db/schema';
import { calculateLimit, getCurrentMonth, getMonthFromDate, calculateExpiryDate } from '@/src/lib/services/referral-images/utils';
import { buildImageToolS3Key, generateImageToolPresignedUpload } from '@/src/lib/image-tool/s3';
import { getDb } from 'database/client';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/referral-images/upload
 *
 * Upload image from mobile, check limits, publish Ably event
 *
 * Request body:
 * - userId: string
 * - imageData: string (base64)
 * - filename?: string
 * - format?: string
 * - metadata?: { side?: 'R' | 'L'; description?: string }
 *
 * Response:
 * - success: boolean
 * - imageId: string
 * - presignedUrl: string
 * - limitReached: boolean
 * - showUpgradeModal: boolean
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, imageData, filename, format, metadata } = body;

    if (!userId || !imageData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = getDb();
    const currentMonth = getCurrentMonth();

    // Get user tier and created date
    const userRow = await db
      .select({
        tier: users.imageTier,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userRow.length) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const tier = userRow[0].tier || 'free';
    const accountCreatedMonth = getMonthFromDate(userRow[0].createdAt);

    // Get or create usage record for current month
    const usageRow = await db
      .select({
        id: imageToolUsage.id,
        imageCount: imageToolUsage.imageCount,
        graceUnlocksUsed: imageToolUsage.graceUnlocksUsed,
      })
      .from(imageToolUsage)
      .where(
        and(
          eq(imageToolUsage.userId, userId),
          eq(imageToolUsage.month, currentMonth)
        )
      )
      .limit(1);

    let imageCount = 0;
    let graceUnlocksUsed = 0;

    if (usageRow.length === 0) {
      // Create new usage record
      await db.insert(imageToolUsage).values({
        userId,
        month: currentMonth,
        imageCount: 0,
        graceUnlocksUsed: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      imageCount = usageRow[0].imageCount;
      graceUnlocksUsed = usageRow[0].graceUnlocksUsed || 0;
    }

    // Calculate limit
    const limit = calculateLimit(tier, accountCreatedMonth, currentMonth, graceUnlocksUsed);

    // Check if limit reached
    if (imageCount >= limit && limit !== 999999) {
      return NextResponse.json({
        success: false,
        limitReached: true,
        showUpgradeModal: true,
        imageCount,
        limit,
      });
    }

    // Process image: decode base64, compress, convert to JPEG
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Compress image: <500KB, 1920px max, JPEG 85% quality
    let compressedBuffer = await sharp(imageBuffer)
      .rotate() // Auto-rotate based on EXIF
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Check size, reduce quality if needed
    if (compressedBuffer.length > 500 * 1024) {
      compressedBuffer = await sharp(imageBuffer)
        .rotate()
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 70 })
        .toBuffer();
    }

    if (compressedBuffer.length > 500 * 1024) {
      compressedBuffer = await sharp(imageBuffer)
        .rotate()
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 50 })
        .toBuffer();
    }

    // Generate imageId and S3 key
    const imageId = nanoid(12);
    const s3Key = buildImageToolS3Key({ userId, imageId, contentType: 'image/jpeg' });

    // Get presigned upload URL
    const { uploadUrl } = await generateImageToolPresignedUpload({
      userId,
      imageId,
      contentType: 'image/jpeg',
    });

    // Upload to S3
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: compressedBuffer,
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`S3 upload failed: ${uploadResponse.status}`);
    }

    // Insert into database
    await db.insert(imageToolUploads).values({
      userId,
      imageId,
      s3Key,
      fileSize: compressedBuffer.length,
      side: metadata?.side || null,
      description: metadata?.description || null,
      createdAt: new Date(),
      expiresAt: calculateExpiryDate(),
    });

    // Increment usage count
    await db
      .update(imageToolUsage)
      .set({
        imageCount: imageCount + 1,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(imageToolUsage.userId, userId),
          eq(imageToolUsage.month, currentMonth)
        )
      );

    // Publish Ably event for real-time desktop update
    try {
      const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY });
      const channel = ably.channels.get(`user:${userId}`);

      await channel.publish('image-uploaded', {
        imageId,
        s3Key,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('[referral-images/upload] Ably publish failed:', error);
      // Don't fail the upload if Ably fails
    }

    // Get presigned download URL for response
    const downloadUrl = `https://${process.env.S3_IMAGE_TOOL_BUCKET_NAME || 'clinicpro-medtech-sessions'}.s3.${process.env.AWS_REGION || 'ap-southeast-2'}.amazonaws.com/${s3Key}`;

    return NextResponse.json({
      success: true,
      imageId,
      presignedUrl: downloadUrl,
      limitReached: false,
      showUpgradeModal: false,
    });
  } catch (error) {
    console.error('[referral-images/upload] Error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
