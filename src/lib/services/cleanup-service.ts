import { eq } from 'drizzle-orm';

import { db } from '../../../database/client';
import { mobileTokens } from '../../../database/schema';

/**
 * Clean up expired mobile tokens (older than now)
 * Returns number of deleted rows
 */
// Expired tokens no longer used (permanent tokens). Keep only inactive cleanup.

/**
 * Clean up inactive mobile tokens (non-expiring permanent tokens)
 * Returns number of deleted rows
 */
export async function cleanupInactiveMobileTokens(): Promise<number> {
  const deleted = await db
    .delete(mobileTokens)
    .where(eq(mobileTokens.isActive, false))
    .returning({ id: mobileTokens.id });

  return deleted.length;
}

/**
 * Delete a specific mobile token by value (unconditionally)
 */
export async function deleteMobileToken(token: string): Promise<boolean> {
  const deleted = await db
    .delete(mobileTokens)
    .where(eq(mobileTokens.token, token))
    .returning({ id: mobileTokens.id });
  return deleted.length > 0;
}

/**
 * Delete a specific mobile token only if it is expired
 */
// deleteExpiredMobileToken removed in Session v2
