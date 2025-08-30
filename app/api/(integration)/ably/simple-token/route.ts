import * as Ably from 'ably';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { mobileTokens } from '@/db/schema';
import { cleanupInactiveMobileTokens } from '@/src/lib/services/cleanup-service';

export async function POST(_request: NextRequest) {
  return NextResponse.json({ error: 'Deprecated endpoint' }, { status: 410 });
}
