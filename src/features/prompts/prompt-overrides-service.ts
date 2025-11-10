import { and, desc, eq } from 'drizzle-orm';

import { getDb } from '../../../database/client';
import { promptRollouts, promptVersions } from '../../../database/schema';

export type ActivePromptVersion = {
  id: string;
  versionNumber: number;
  systemText: string;
  userText: string;
};

const cache = new Map<string, { v: ActivePromptVersion | null; ts: number }>();
const TTL_MS = 60_000;

function cacheKey(userId: string | null): string {
  return `u:${userId || 'anon'}`;
}

export class PromptOverridesService {
  static async getActiveForUser(userId: string | null): Promise<ActivePromptVersion | null> {
    const key = cacheKey(userId);
    const now = Date.now();
    const hit = cache.get(key);
    if (hit && now - hit.ts < TTL_MS) {
 return hit.v;
}

    const db = getDb();

    // 1) Self rollout (latest)
    let version: any = null;
    if (userId) {
      const selfRollout = await db
        .select({ versionId: promptRollouts.versionId })
        .from(promptRollouts)
        .where(and(eq(promptRollouts.scope, 'self'), eq(promptRollouts.userId, userId)))
        .orderBy(desc(promptRollouts.createdAt))
        .limit(1);
      const selfVersionId = selfRollout?.[0]?.versionId;
      if (selfVersionId) {
        const rows = await db
          .select()
          .from(promptVersions)
          .where(eq(promptVersions.id, selfVersionId))
          .limit(1);
        version = rows?.[0] || null;
      }
    }

    // 2) Global rollout (latest)
    if (!version) {
      const globalRollout = await db
        .select({ versionId: promptRollouts.versionId })
        .from(promptRollouts)
        .where(eq(promptRollouts.scope, 'global'))
        .orderBy(desc(promptRollouts.createdAt))
        .limit(1);
      const globalVersionId = globalRollout?.[0]?.versionId;
      if (globalVersionId) {
        const rows = await db
          .select()
          .from(promptVersions)
          .where(eq(promptVersions.id, globalVersionId))
          .limit(1);
        version = rows?.[0] || null;
      }
    }

    const active: ActivePromptVersion | null = version
      ? {
          id: version.id,
          versionNumber: version.versionNumber,
          systemText: version.systemText,
          userText: version.userText,
        }
      : null;

    cache.set(key, { v: active, ts: now });
    return active;
  }

  static invalidate(userId?: string | null) {
    if (userId) {
 cache.delete(cacheKey(userId));
}
    cache.delete(cacheKey(null));
  }
}
