import { auth } from '@clerk/nextjs/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';

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
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get image key from query params
    const key = req.nextUrl.searchParams.get('key');
    if (!key) {
      return NextResponse.json({ error: 'Image key is required' }, { status: 400 });
    }

    // Validate that the key belongs to a consultation (security check)
    if (!key.startsWith('consultations/')) {
      return NextResponse.json({ error: 'Invalid image key' }, { status: 400 });
    }

    // Create presigned URL for GET operation
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const downloadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return NextResponse.json({
      downloadUrl,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Error generating download URL:', error);
    return NextResponse.json({ 
      error: 'Failed to generate download URL',
      details: process.env.NODE_ENV === 'development' ? error : undefined 
    }, { status: 500 });
  }
} 