import { auth } from '@clerk/nextjs/server';
import { getDb } from 'database/client';
import { and, desc, gt, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { imageToolUploads } from '@/db/schema';
import { generateImageToolPresignedDownload } from '@/src/lib/image-tool/s3';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const now = new Date();

  const rows = await db
    .select({
      id: imageToolUploads.id,
      s3Key: imageToolUploads.s3Key,
      createdAt: imageToolUploads.createdAt,
      fileSize: imageToolUploads.fileSize,
    })
    .from(imageToolUploads)
    .where(and(eq(imageToolUploads.userId, userId), gt(imageToolUploads.expiresAt, now)))
    .orderBy(desc(imageToolUploads.createdAt))
    .limit(50);

  const images = await Promise.all(rows.map(async (row) => {
    const signed = await generateImageToolPresignedDownload(row.s3Key);
    return {
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      downloadUrl: signed.downloadUrl,
      fileSize: row.fileSize ?? null,
    };
  }));

  return NextResponse.json({
    images,
    count: images.length,
  });
}

