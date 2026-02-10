import { getDb } from 'database/client';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { openmailerCampaigns } from '@/db/schema';

function isAdminAuth(req: NextRequest): boolean {
  return req.headers.get('x-user-tier') === 'admin';
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!isAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const { id } = await context.params;
  const db = getDb();
  const [campaign] = await db
    .select()
    .from(openmailerCampaigns)
    .where(eq(openmailerCampaigns.id, id))
    .limit(1);
  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }
  return NextResponse.json(campaign);
}
