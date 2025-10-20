import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
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
type MetaEntry = { etag?: string; lastModified?: string; contentType?: string; size?: number; t: number };
const META_CACHE = new Map<string, MetaEntry>();
const META_TTL_MS = 10 * 60 * 1000; // 10 minutes
const META_CACHE_MAX = 2000; // simple cap to bound memory

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

    // Authorisation: only allow keys under the requesting user's namespace
    // Allowed patterns: clinical-images/{userId}/... and thumbnails/clinical-images/{userId}/...
    const userPrefix = `clinical-images/${userId}/`;
    const thumbPrefix = `thumbnails/clinical-images/${userId}/`;
    if (!(key.startsWith(userPrefix) || key.startsWith(thumbPrefix))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

    // Skip expensive HEAD when meta is missing; we'll populate after GET

    // Conditional GET
    if (ifNoneMatch && meta?.etag && ifNoneMatch.replaceAll('"', '') === meta.etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': `"${meta.etag}"`,
          ...(meta.lastModified ? { 'Last-Modified': meta.lastModified } : {}),
          'Cache-Control': 'public, max-age=600, stale-while-revalidate=86400',
        },
      });
    }
    if (ifModifiedSince && meta?.lastModified) {
      const ims = new Date(ifModifiedSince).getTime();
      const lm = new Date(meta.lastModified).getTime();
      if (!Number.isNaN(ims) && !Number.isNaN(lm) && ims >= lm) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': meta.etag ? `"${meta.etag}"` : undefined,
          ...(meta.lastModified ? { 'Last-Modified': meta.lastModified } : {}),
          'Cache-Control': 'public, max-age=600, stale-while-revalidate=86400',
        } as Record<string, string>,
      });
      }
    }

    // Stream bytes
    let obj;
    try {
      obj = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    } catch (e: any) {
      // Missing keys should return 404 to avoid flapping; other errors 500
      const isNotFound = e?.$metadata?.httpStatusCode === 404 || /NoSuchKey|NotFound/i.test(e?.name || '');
      if (isNotFound) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
    }
    // Convert Node stream to Web ReadableStream if necessary
    const nodeBody: any = obj.Body as any;
    const body: any = typeof (nodeBody as any).transformToWebStream === 'function'
      ? (nodeBody as any).transformToWebStream()
      : (nodeBody as any);
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
    // Enforce simple LRU cap
    if (META_CACHE.size > META_CACHE_MAX) {
      // Remove oldest entries until under cap
      let overflow = META_CACHE.size - META_CACHE_MAX;
      const entries: Array<[string, MetaEntry]> = Array.from(META_CACHE.entries());
      entries.sort((a, b) => a[1].t - b[1].t);
      for (const [k] of entries) {
        if (overflow <= 0) break;
        META_CACHE.delete(k);
        overflow -= 1;
      }
    }

    return new NextResponse(body as any, {
      status: 200,
      headers,
    });
  } catch (err) {
    // Avoid flapping thumbnails; surface 404 for missing keys
    return NextResponse.json({ error: 'Failed to fetch thumbnail' }, { status: 500 });
  }
}
