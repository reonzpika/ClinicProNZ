// @ts-nocheck
import { sql } from 'drizzle-orm';

import { getDb } from 'database/client';

export const runtime = 'nodejs';

function isAuthorized(req: Request, url: URL): boolean {
  const secret = ((globalThis as any).process?.env?.CRON_SECRET as string) || '';
  if (!secret) return false;

  const token = url.searchParams.get('token') || '';
  const isVercelCron = req.headers.get('x-vercel-cron') === '1';
  const authHeader = req.headers.get('authorization') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  // Allow either query token or Bearer token. Prefer presence of x-vercel-cron when invoked by Vercel.
  return Boolean((isVercelCron && token === secret) || bearer === secret || token === secret);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    if (!isAuthorized(req, url)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }

    const db = getDb();

    // Hard-delete sessions older than 1 day with no meaningful content
    const query = sql`WITH candidates AS (
  SELECT id
  FROM patient_sessions
  WHERE created_at < NOW() - INTERVAL '1 day'
    AND (
      COALESCE(
        NULLIF(BTRIM(problems_text), ''),
        NULLIF(BTRIM(objective_text), ''),
        NULLIF(BTRIM(assessment_text), ''),
        NULLIF(BTRIM(plan_text), ''),
        NULLIF(BTRIM(typed_input), '')
      ) IS NULL
    )
    AND (
      transcriptions IS NULL
      OR (
        CASE
          WHEN COALESCE(BTRIM(transcriptions), '') = '' THEN '[]'::jsonb
          ELSE transcriptions::jsonb
        END IN ('[]'::jsonb, '{}'::jsonb)
      )
    )
)
DELETE FROM patient_sessions ps
USING candidates c
WHERE ps.id = c.id
RETURNING ps.id;`;

    const result: any = await db.execute(query);
    const deletedCount = Array.isArray((result as any)?.rows) ? (result as any).rows.length : ((result as any)?.rowCount ?? 0);

    return new Response(JSON.stringify({ success: true, deletedCount }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in cleanup-empty-sessions cron:', error);
    return new Response(JSON.stringify({ error: 'Cleanup failed' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

