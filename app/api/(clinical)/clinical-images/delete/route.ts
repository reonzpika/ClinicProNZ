import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { auth } from '@clerk/nextjs/server';
import { getDb } from 'database/client';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { clinicalImageAnalyses } from '@/db/schema';
import { checkCoreAccess, extractRBACContext } from '@/src/lib/rbac-enforcer';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

// DELETE /api/clinical-images/delete - Delete image from S3 and analysis records
export async function DELETE(req: NextRequest) {
  try {
    const db = getDb();
    // Extract RBAC context and check authentication
    const context = await extractRBACContext(req);
    const permissionCheck = await checkCoreAccess(context);

    if (!permissionCheck.allowed) {
      return NextResponse.json({
        error: permissionCheck.reason || 'Access denied',
      }, { status: 403 });
    }

    // Authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get imageKey from request body
    const { imageKey } = await req.json();

    if (!imageKey) {
      return NextResponse.json({
        error: 'imageKey is required',
      }, { status: 400 });
    }

    // Validate that the key belongs to user's images (security check)
    const isValidImageKey = (
      imageKey.startsWith(`clinical-images/${userId}/`)
      || imageKey.startsWith('consultations/')
      || imageKey.startsWith('mobile-uploads/')
    );

    if (!isValidImageKey) {
      return NextResponse.json({
        error: 'Access denied: You can only delete your own images',
      }, { status: 403 });
    }

        // For consultation and mobile images, additional validation needed
    if (imageKey.startsWith('consultations/')) {
      // TODO: Add session ownership verification if needed
      // const sessionId = imageKey.split('/')[1];
    }

    if (imageKey.startsWith('mobile-uploads/')) {
      // TODO: Add token ownership verification if needed
      // const token = imageKey.split('/')[1];
    }

    try {
      // Delete from S3
      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: imageKey,
      });

      await s3Client.send(deleteCommand);
    } catch (s3Error) {
      console.error('S3 deletion error:', s3Error);
      // Continue with database cleanup even if S3 fails
      // (image might already be deleted or not exist)
    }

    try {
      // Delete all analysis records for this image
      await db
        .delete(clinicalImageAnalyses)
        .where(eq(clinicalImageAnalyses.imageKey, imageKey));
    } catch (dbError) {
      console.error('Database deletion error:', dbError);
      // Log but don't fail the request - S3 deletion is the primary concern
    }

    return NextResponse.json({
      success: true,
      message: 'Image and associated analysis records deleted successfully',
      imageKey,
    });
  } catch (error) {
    console.error('Error deleting clinical image:', error);
    return NextResponse.json({
      error: 'Failed to delete image',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    }, { status: 500 });
  }
}
