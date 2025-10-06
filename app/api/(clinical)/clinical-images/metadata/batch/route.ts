import { auth } from '@clerk/nextjs/server';
import { getDb } from 'database/client';
import { eq, inArray } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { clinicalImageMetadata, patientSessions } from '@/db/schema';
import { checkCoreAccess, extractRBACContext } from '@/src/lib/rbac-enforcer';

// Naming helpers
function sanitizePart(part?: string): string | undefined {
  if (!part) {
 return undefined;
}
  const cleaned = part
    .replace(/[^\w -]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) {
 return undefined;
}
  return cleaned.slice(0, 80);
}

function formatDate(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const context = await extractRBACContext(req);
    const permissionCheck = await checkCoreAccess(context);
    if (!permissionCheck.allowed) {
      return NextResponse.json({ error: permissionCheck.reason || 'Access denied' }, { status: 403 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const items: Array<{ imageKey: string; sessionId?: string | null; patientName?: string; identifier?: string; displayName?: string }>
      = Array.isArray(payload?.items) ? payload.items : [];
    if (items.length === 0) {
      return NextResponse.json({ success: true, upserted: 0 });
    }

    // Validate ownership of keys and collect session ids from path
    const validated: Array<{ imageKey: string; sessionId: string | null; patientName?: string; identifier?: string; displayName?: string }>
      = [];

    for (const item of items) {
      const { imageKey } = item;
      if (!imageKey || !imageKey.startsWith(`clinical-images/${userId}/`)) {
        continue;
      }
      // Derive sessionId from path if present
      const parts = imageKey.split('/');
      // clinical-images/{userId}/{optionalSessionId}/{file}
      const derivedSessionId: string | null = parts.length >= 4 && parts[2] ? parts[2] : null;
      validated.push({
        imageKey,
        sessionId: derivedSessionId,
        patientName: sanitizePart(item.patientName),
        identifier: sanitizePart(item.identifier),
        displayName: sanitizePart(item.displayName),
      });
    }

    if (validated.length === 0) {
      return NextResponse.json({ success: true, upserted: 0 });
    }

    // Build default names for items lacking displayName (date + time)
    const today = formatDate();

    // Fetch patient names for involved sessions (best effort)
    const sessionIds = Array.from(new Set(validated.map(v => v.sessionId).filter((s): s is string => !!s)));
    const sessionNameMap: Record<string, string | null> = {};
    if (sessionIds.length > 0) {
      try {
        const rows = await db
          .select({ id: patientSessions.id, patientName: patientSessions.patientName })
          .from(patientSessions)
          .where(inArray(patientSessions.id, sessionIds));
        rows.forEach((r) => {
 sessionNameMap[r.id] = r.patientName || null;
});
      } catch {}
    }

    const rows = [] as Array<{ imageKey: string; userId: string; sessionId: string | null; displayName: string | null; patientName: string | null; identifier: string | null }>;

    for (const v of validated) {
      const basePatient = v.patientName;
      const baseIdentifier = v.identifier;

      let displayName = v.displayName;
      if (!displayName) {
        const parts: string[] = [];
        if (basePatient) {
 parts.push(basePatient);
}
        if (baseIdentifier) {
 parts.push(baseIdentifier);
}
        if (parts.length === 0) {
          // fallback to session patient name if available
          const sessionName = (v.sessionId && sessionNameMap[v.sessionId]) || 'Patient';
          parts.push(sessionName);
        }
        // Append date and time (HH:mm)
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const timeStr = `${hh}:${mm}`;
        const prefix = parts.join(' ');
        displayName = `${prefix} ${today} ${timeStr}`;
      }

      rows.push({
        imageKey: v.imageKey,
        userId,
        sessionId: v.sessionId,
        displayName,
        patientName: basePatient || null,
        identifier: baseIdentifier || null,
      });
    }

    // Upsert rows
    for (const row of rows) {
      // Try update; if none, insert
      const updated = await db
        .update(clinicalImageMetadata)
        .set({
          userId: row.userId,
          sessionId: row.sessionId,
          displayName: row.displayName,
          patientName: row.patientName,
          identifier: row.identifier,
          updatedAt: new Date(),
        })
        .where(eq(clinicalImageMetadata.imageKey, row.imageKey))
        .returning({ imageKey: clinicalImageMetadata.imageKey });

      if (!updated?.[0]) {
        await db.insert(clinicalImageMetadata).values({
          imageKey: row.imageKey,
          userId: row.userId,
          sessionId: row.sessionId,
          displayName: row.displayName,
          patientName: row.patientName,
          identifier: row.identifier,
        });
      }
    }

    return NextResponse.json({ success: true, upserted: rows.length });
  } catch (error) {
    console.error('Error upserting clinical image metadata batch:', error);
    return NextResponse.json({ error: 'Failed to upsert metadata' }, { status: 500 });
  }
}
