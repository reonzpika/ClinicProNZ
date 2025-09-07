import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { auth } from '@clerk/nextjs/server';
import { getDb } from 'database/client';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { users } from '@/db/schema';

// Initialize S3 client for NZ region
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-2', // NZ region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    // Simplified authentication - Clerk only
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get file metadata from query params
    const filename = req.nextUrl.searchParams.get('filename') || 'image.jpg';
    const mimeType = req.nextUrl.searchParams.get('mimeType') || 'image/jpeg';

    // 🆕 SERVER-SIDE SESSION RESOLUTION: Auto-lookup current session from database
    let patientSessionId: string | null = null;
    try {
      const userRows = await db
        .select({ currentSessionId: users.currentSessionId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      patientSessionId = userRows?.[0]?.currentSessionId || null;
    } catch (error) {
      console.error('Failed to lookup current session:', error);
      // Continue without session - images will be saved to user folder root
    }

    // Validate file type
    if (!mimeType.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Generate unique key for S3 object based on upload type
    const timestamp = Date.now();
    const fileExtension = filename.split('.').pop() || 'jpg';
    const uniqueFilename = `${timestamp}-${uuidv4()}.${fileExtension}`;

    // Build key under clinical-images/{userId}/ with optional session folder
    const basePrefix = `clinical-images/${userId}/`;
    const key = patientSessionId
      ? `${basePrefix}${patientSessionId}/${uniqueFilename}`
      : `${basePrefix}${uniqueFilename}`;

    // Create presigned URL for PUT operation
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: mimeType,
      // Temporarily remove ServerSideEncryption to test
      Metadata: {
        ...(patientSessionId && { 'patient-session-id': patientSessionId }),
        'upload-type': 'clinical',
        'uploaded-by': userId,
        'original-filename': filename,
        'upload-timestamp': timestamp.toString(),
      },
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300, // 5 minutes
    });

    return NextResponse.json({
      uploadUrl,
      key,
      expiresIn: 300,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json({
      error: 'Failed to generate upload URL',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    }, { status: 500 });
  }
}
