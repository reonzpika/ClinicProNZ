import * as Ably from 'ably';
import { getDb } from 'database/client';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { patientSessions } from '@/db/schema';
import { extractRBACContext } from '@/src/lib/rbac-enforcer';

// Deprecated: use DELETE /api/patient-sessions (soft-delete via deletedAt)
export async function POST() {
  return NextResponse.json({ error: 'Deprecated: use DELETE /api/patient-sessions' }, { status: 410 });
}
