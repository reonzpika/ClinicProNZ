import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { generateImageToolPresignedUpload } from '@/src/lib/image-tool/s3';
import { getImageToolUsage, resolveImageToolUserIdFromToken } from '@/src/lib/image-tool/shared';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) as any;
    const token = body?.u as string | undefined;
    const imageId = body?.imageId as string | undefined;
    const contentType = (body?.contentType as string | undefined) || 'image/jpeg';

    if (!token || !imageId) {
      return NextResponse.json({ error: 'u and imageId are required' }, { status: 400 });
    }

    const userId = await resolveImageToolUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid link' }, { status: 404 });
    }

    const usage = await getImageToolUsage(userId);

    // Enforce free-tier cap
    if (usage.tier === 'free' && usage.limit !== null && usage.imagesUsedThisMonth >= usage.limit) {
      return NextResponse.json(
        {
          error: 'Monthly limit reached',
          message: `Free tier is limited to ${usage.limit} images per month`,
          code: 'LIMIT_REACHED',
        },
        { status: 402 },
      );
    }

    // Enforce free-tier format restriction
    if (usage.tier === 'free' && contentType !== 'image/jpeg') {
      return NextResponse.json(
        { error: 'Free tier only supports JPEG', code: 'FORMAT_NOT_ALLOWED' },
        { status: 403 },
      );
    }

    const result = await generateImageToolPresignedUpload({
      userId,
      imageId,
      contentType,
    });

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to generate presigned URL' },
      { status: 500 },
    );
  }
}

