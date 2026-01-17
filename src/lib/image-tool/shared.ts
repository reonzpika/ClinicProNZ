import { getDb } from 'database/client';
import { and, eq } from 'drizzle-orm';

import { imageToolMobileLinks, imageToolUsage, imageToolUploads, users } from '@/db/schema';

export const IMAGE_TOOL_FREE_MONTHLY_LIMIT = 20;

export type ImageToolTier = 'free' | 'premium';

export function getNzMonthKey(date: Date = new Date()): string {
  // YYYY-MM in Pacific/Auckland time
  const parts = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(date);
  const yyyy = parts.find(p => p.type === 'year')?.value || '1970';
  const mm = parts.find(p => p.type === 'month')?.value || '01';
  return `${yyyy}-${mm}`;
}

export async function resolveImageToolUserIdFromToken(token: string): Promise<string | null> {
  const db = getDb();
  const rows = await db
    .select({ userId: imageToolMobileLinks.userId })
    .from(imageToolMobileLinks)
    .where(and(eq(imageToolMobileLinks.token, token), eq(imageToolMobileLinks.isActive, true)))
    .limit(1);
  return rows[0]?.userId || null;
}

export async function getImageToolTierForUserId(userId: string): Promise<ImageToolTier> {
  const db = getDb();
  const rows = await db
    .select({ imageTier: users.imageTier })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const tier = rows[0]?.imageTier;
  return tier === 'premium' ? 'premium' : 'free';
}

export async function getImageToolUsage(userId: string): Promise<{
  tier: ImageToolTier;
  imagesUsedThisMonth: number;
  limit: number | null;
  month: string;
}> {
  const db = getDb();
  const tier = await getImageToolTierForUserId(userId);
  const month = getNzMonthKey();

  const usageRows = await db
    .select({ imageCount: imageToolUsage.imageCount })
    .from(imageToolUsage)
    .where(and(eq(imageToolUsage.userId, userId), eq(imageToolUsage.month, month)))
    .limit(1);

  const imagesUsedThisMonth = usageRows[0]?.imageCount ?? 0;

  return {
    tier,
    imagesUsedThisMonth,
    limit: tier === 'premium' ? null : IMAGE_TOOL_FREE_MONTHLY_LIMIT,
    month,
  };
}

export function getExpiresAt24hFromNow(now: Date = new Date()): Date {
  return new Date(now.getTime() + 24 * 60 * 60 * 1000);
}

export async function recordImageToolUpload(args: {
  userId: string;
  imageId: string;
  s3Key: string;
  fileSize?: number | null;
}): Promise<void> {
  const db = getDb();
  const now = new Date();
  const expiresAt = getExpiresAt24hFromNow(now);

  await db.insert(imageToolUploads).values({
    userId: args.userId,
    imageId: args.imageId,
    s3Key: args.s3Key,
    fileSize: args.fileSize ?? null,
    createdAt: now,
    expiresAt,
  });
}

