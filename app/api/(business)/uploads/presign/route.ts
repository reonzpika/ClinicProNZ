import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { auth } from '@clerk/nextjs/server';
import { getDb } from 'database/client';
import { and, eq, isNull } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { patientSessions, users } from '@/db/schema';

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
    const providedSessionId = req.nextUrl.searchParams.get('sessionId');
    const noSessionParam = req.nextUrl.searchParams.get('noSession');
    const context = req.nextUrl.searchParams.get('context') || undefined; // e.g., image-desktop

    // 🆕 SERVER-SIDE SESSION RESOLUTION (feature-aware)
    let patientSessionId: string | null = null;
    let patientNameForSession: string | null = null;
    try {
      // If explicitly requested to upload without session, honour it
      const wantsNoSession = noSessionParam === '1' || noSessionParam === 'true';

      if (!wantsNoSession && providedSessionId) {
        // Validate the provided session belongs to the user and is not deleted
        const rows = await db
          .select({ id: patientSessions.id, patientName: patientSessions.patientName })
          .from(patientSessions)
          .where(and(eq(patientSessions.id, providedSessionId), eq(patientSessions.userId, userId), isNull(patientSessions.deletedAt)))
          .limit(1);
        if (rows?.[0]?.id) {
          patientSessionId = rows[0].id;
          patientNameForSession = rows[0].patientName || 'Patient';
        }
      }

      // Fallback to previous behaviour (currentSessionId) only when not explicitly noSession and no valid provided session
      if (!patientSessionId && !wantsNoSession) {
        const userRows = await db
          .select({ currentSessionId: users.currentSessionId })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        patientSessionId = userRows?.[0]?.currentSessionId || null;
        if (patientSessionId) {
          try {
            const rows = await db
              .select({ id: patientSessions.id, patientName: patientSessions.patientName })
              .from(patientSessions)
              .where(and(eq(patientSessions.id, patientSessionId), eq(patientSessions.userId, userId), isNull(patientSessions.deletedAt)))
              .limit(1);
            if (rows?.[0]?.id) {
              patientNameForSession = rows[0].patientName || 'Patient';
            } else {
              // If currentSessionId invalid, clear it
              patientSessionId = null;
            }
          } catch {}
        }
      }
    } catch (error) {
      console.error('Failed to resolve session context:', error);
      // Continue without session - images will be saved to user folder root
      patientSessionId = null;
      patientNameForSession = null;
    }

    // Validate file type
    if (!mimeType.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Generate key for S3 object based on upload type
    const timestamp = Date.now();
    const fileExtension = (filename.split('.').pop() || 'jpg').toLowerCase();

    // Helper to format NZ local date/time into desired pattern
    const formatNzDateTime = (date: Date): { dateStr: string; timeStr: string; compactTime: string } => {
      const parts = new Intl.DateTimeFormat('en-NZ', {
        timeZone: 'Pacific/Auckland',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).formatToParts(date);
      const get = (type: string) => parts.find(p => p.type === type)?.value || '';
      // en-NZ gives DD/MM/YYYY; we want YYYY-MM-DD
      const yyyy = get('year');
      const mm = get('month');
      const dd = get('day');
      const hh = get('hour');
      const min = get('minute');
      const ss = get('second');
      const ms = String(date.getMilliseconds()).padStart(3, '0');
      return {
        dateStr: `${yyyy}-${mm}-${dd}`,
        timeStr: `${hh}${min}${ss}${ms}`,
        compactTime: `${hh}${min}${ss}${ms}`,
      };
    };

    const basePrefix = `clinical-images/${userId}/`;
    let key: string;

    if (patientSessionId && patientNameForSession) {
      const now = new Date();
      const { dateStr, compactTime } = formatNzDateTime(now);
      const safePatient = (patientNameForSession || 'Patient').replaceAll('/', '-');
      const baseName = `${safePatient} ${dateStr} ${compactTime}`.trim();
      key = `${basePrefix}${patientSessionId}/${baseName}.${fileExtension}`;
    } else {
      // No session: keep existing randomised naming
      const uniqueFilename = `${timestamp}-${uuidv4()}.${fileExtension}`;
      key = `${basePrefix}${uniqueFilename}`;
    }

    // Create presigned URL for PUT operation
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: mimeType,
      ServerSideEncryption: 'AES256',
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
