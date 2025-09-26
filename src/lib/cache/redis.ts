// @ts-nocheck
import { Redis } from '@upstash/redis';

let redisClient: Redis | null = null;

export function getRedis(): Redis | null {
  try {
    if (redisClient) {
      return redisClient;
    }
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_TOKEN;
    if (!url || !token) {
      return null;
    }
    redisClient = new Redis({ url, token });
    return redisClient;
  } catch {
    return null;
  }
}

export async function cacheGet<T = unknown>(key: string): Promise<T | null> {
  const client = getRedis();
  if (!client) {
    return null;
  }
  try {
    const value = await client.get<T>(key);
    return (value as T) ?? null;
  } catch {
    return null;
  }
}

export async function cacheSet<T = unknown>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const client = getRedis();
  if (!client) {
    return;
  }
  try {
    await client.set(key, value, { ex: ttlSeconds });
  } catch {
    // ignore cache errors
  }
}

export function hoursToSeconds(hours: number): number {
  const h = Number.isFinite(hours) && hours > 0 ? hours : 72;
  return Math.round(h * 3600);
}

