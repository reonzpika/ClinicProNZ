import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

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
    // Check authentication - support both Clerk JWT and mobile session token
    const { userId } = await auth();
    const sessionToken = req.nextUrl.searchParams.get('session');

    if (!userId && !sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If using session token, validate it (simplified version)
    if (sessionToken && !userId) {
      // TODO: Add proper session token validation when mobile auth is implemented
      // For now, accept any session token in development
      if (!sessionToken.match(/^[a-f0-9-]{36}$/)) {
        return NextResponse.json({ error: 'Invalid session token' }, { status: 401 });
      }
    }

    // Get file metadata from query params
    const filename = req.nextUrl.searchParams.get('filename') || 'image.jpg';
    const mimeType = req.nextUrl.searchParams.get('mimeType') || 'image/jpeg';
    const patientSessionId = req.nextUrl.searchParams.get('patientSessionId');
    const mobileTokenId = req.nextUrl.searchParams.get('mobileTokenId');

    // Require either patient session ID or mobile token ID
    if (!patientSessionId && !mobileTokenId) {
      return NextResponse.json({ error: 'Either patientSessionId or mobileTokenId is required' }, { status: 400 });
    }

    // Validate file type
    if (!mimeType.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Generate unique key for S3 object based on upload type
    const timestamp = Date.now();
    const fileExtension = filename.split('.').pop() || 'jpg';
    const uniqueFilename = `${timestamp}-${uuidv4()}.${fileExtension}`;

    let key: string;
    if (patientSessionId) {
      // Traditional consultation image path
      key = `consultations/${patientSessionId}/${uniqueFilename}`;
    } else {
      // Mobile upload path using token ID
      key = `mobile-uploads/${mobileTokenId}/${uniqueFilename}`;
    }

    // Create presigned URL for PUT operation
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: mimeType,
      ServerSideEncryption: 'AES256',
      Metadata: {
        ...(patientSessionId && { 'patient-session-id': patientSessionId }),
        ...(mobileTokenId && { 'mobile-token-id': mobileTokenId }),
        'upload-type': patientSessionId ? 'consultation' : 'mobile',
        'uploaded-by': userId || 'mobile-session',
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
