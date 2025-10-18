import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { auth } from '@clerk/nextjs/server';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.S3_BUCKET_NAME!;

// In-memory tiny LRU for ETag/Last-Modified (best-effort)
const META_CACHE = new Map<string, { etag?: string; lastModified?: string; contentType?: string; size?: number; t: number }>();
const META_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function GET(req: NextRequest) {
  try {
    const key = req.nextUrl.searchParams.get('key');
    if (!key) {
      return NextResponse.json({ error: 'Missing key' }, { status: 400 });
    }

    // AuthN (lightweight) - deny if unauthenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cacheKey = key;
    let meta = META_CACHE.get(cacheKey);
    const now = Date.now();
    if (meta && now - meta.t > META_TTL_MS) {
      META_CACHE.delete(cacheKey);
      meta = undefined;
    }

    // If we have meta and client sends conditional headers, allow 304
    const ifNoneMatch = req.headers.get('if-none-match') || undefined;
    const ifModifiedSince = req.headers.get('if-modified-since') || undefined;

    if (!meta) {
      try {
        const head = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
        meta = {
          etag: head.ETag?.replaceAll('"', ''),
          lastModified: head.LastModified ? new Date(head.LastModified).toUTCString() : undefined,
          contentType: head.ContentType || 'image/jpeg',
          size: head.ContentLength || 0,
          t: now,
        };
        META_CACHE.set(cacheKey, meta);
      } catch (e: any) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }

    // Conditional GET
    if (ifNoneMatch && meta.etag && ifNoneMatch.replaceAll('"', '') === meta.etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': `"${meta.etag}"`,
          ...(meta.lastModified ? { 'Last-Modified': meta.lastModified } : {}),
          'Cache-Control': 'public, max-age=600, stale-while-revalidate=86400',
        },
      });
    }
    if (ifModifiedSince && meta.lastModified && new Date(ifModifiedSince).toUTCString() === meta.lastModified) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': meta.etag ? `"${meta.etag}"` : undefined,
          ...(meta.lastModified ? { 'Last-Modified': meta.lastModified } : {}),
          'Cache-Control': 'public, max-age=600, stale-while-revalidate=86400',
        } as Record<string, string>,
      });
    }

    // Stream bytes
    const obj = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const body = obj.Body as ReadableStream<any>;
    const headers: Record<string, string> = {
      'Content-Type': obj.ContentType || meta.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=600, stale-while-revalidate=86400',
    };
    if (obj.ETag) headers['ETag'] = obj.ETag;
    if (obj.LastModified) headers['Last-Modified'] = new Date(obj.LastModified).toUTCString();

    // Update meta cache
    META_CACHE.set(cacheKey, {
      etag: obj.ETag?.replaceAll('"', ''),
      lastModified: obj.LastModified ? new Date(obj.LastModified).toUTCString() : meta.lastModified,
      contentType: obj.ContentType || meta.contentType,
      size: Number(obj.ContentLength || meta.size || 0),
      t: now,
    });

    return new NextResponse(body as any, {
      status: 200,
      headers,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch thumbnail' }, { status: 500 });
  }
}
