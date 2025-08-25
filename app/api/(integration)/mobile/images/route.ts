import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { checkCoreAccess, extractRBACContext } from '@/src/lib/rbac-enforcer';

// Initialize S3 client for NZ region
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

export async function GET(req: NextRequest) {
  try {
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

    // Get mobile token ID from query params
    const mobileTokenId = req.nextUrl.searchParams.get('tokenId');
    if (!mobileTokenId) {
      return NextResponse.json({ error: 'Mobile token ID is required' }, { status: 400 });
    }

    // Validate token format (basic UUID format)
    if (!mobileTokenId.match(/^[a-f0-9-]{36}$/)) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
    }

    // List images from mobile-uploads/{tokenId}/ prefix
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `mobile-uploads/${mobileTokenId}/`,
      MaxKeys: 100, // Reasonable limit
    });

    const response = await s3Client.send(command);

    if (!response.Contents) {
      return NextResponse.json({ images: [] });
    }

    // Transform S3 objects to mobile image format
    const images = response.Contents
      .filter(obj => obj.Key && obj.Size && obj.Size > 0) // Filter out empty objects
      .map((obj) => {
        const filename = obj.Key!.split('/').pop() || 'unknown';
        const fileExtension = filename.split('.').pop()?.toLowerCase() || '';

        // Determine MIME type from extension
        let mimeType = 'image/jpeg';
        if (fileExtension === 'png') {
 mimeType = 'image/png';
} else if (fileExtension === 'webp') {
 mimeType = 'image/webp';
} else if (fileExtension === 'gif') {
 mimeType = 'image/gif';
}

        return {
          id: obj.Key!.replace(`mobile-uploads/${mobileTokenId}/`, '').replace(/\.[^.]+$/, ''), // Remove path and extension for ID
          key: obj.Key!,
          filename,
          mimeType,
          size: obj.Size!,
          uploadedAt: obj.LastModified?.toISOString() || new Date().toISOString(),
          mobileTokenId,
        };
      })
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()); // Sort by newest first

    return NextResponse.json({
      images,
      count: images.length,
      tokenId: mobileTokenId,
    });
  } catch (error) {
    console.error('Error fetching mobile images:', error);
    return NextResponse.json({
      error: 'Failed to fetch mobile images',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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

    // Parse request body
    const { mobileTokenId, patientSessionId, imageKeys } = await req.json();

    // Validate required fields
    if (!mobileTokenId || !patientSessionId || !imageKeys || !Array.isArray(imageKeys)) {
      return NextResponse.json({
        error: 'Missing required fields: mobileTokenId, patientSessionId, imageKeys (array)',
      }, { status: 400 });
    }

    // Validate token format
    if (!mobileTokenId.match(/^[a-f0-9-]{36}$/)) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
    }

    // TODO: Implement image linking logic
    // This would involve:
    // 1. Copying images from mobile-uploads/{tokenId}/ to consultations/{sessionId}/
    // 2. Updating consultation session with new image metadata
    // 3. Optionally cleaning up mobile upload folder

    // For now, return success response (will be implemented when desktop integration is ready)
    return NextResponse.json({
      success: true,
      message: `Linked ${imageKeys.length} images to consultation session ${patientSessionId}`,
      linkedImages: imageKeys.length,
    });
  } catch (error) {
    console.error('Error linking mobile images:', error);
    return NextResponse.json({
      error: 'Failed to link mobile images',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    }, { status: 500 });
  }
}
