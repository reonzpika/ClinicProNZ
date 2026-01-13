import crypto from 'node:crypto';

export type MedtechLaunchContext = {
  patientId: string;
  facilityId: string;
  providerId?: string;
  createdTime?: string;
};

type LaunchCookiePayload = {
  v: 1;
  exp: number; // epoch ms
  ctx: MedtechLaunchContext;
};

type CookieStore = {
  get(name: string): { value?: string } | undefined;
  set(name: string, value: string, options: Record<string, any>): void;
  delete(name: string): void;
};

const COOKIE_NAME = 'medtech_launch';
const DEFAULT_TTL_SECONDS = 5 * 60;

function base64UrlEncode(buf: Buffer) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecodeToBuffer(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (base64.length % 4)) % 4;
  return Buffer.from(base64 + '='.repeat(padLength), 'base64');
}

function getSecretKeyBytes() {
  const raw = process.env.MEDTECH_LAUNCH_COOKIE_SECRET;
  if (!raw || !raw.trim()) return null;
  try {
    const bytes = Buffer.from(raw.trim(), 'base64');
    if (bytes.length !== 32) return null; // AES-256 key length
    return bytes;
  } catch {
    return null;
  }
}

function encryptJson(payload: unknown) {
  const secret = getSecretKeyBytes();
  if (!secret) {
    throw new Error('MEDTECH_LAUNCH_COOKIE_SECRET missing or invalid (expected base64 32 bytes)');
  }

  const iv = crypto.randomBytes(12); // recommended for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', secret, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  // token = iv(12) + tag(16) + ciphertext
  return base64UrlEncode(Buffer.concat([iv, tag, ciphertext]));
}

function decryptJson<T>(token: string): T {
  const secret = getSecretKeyBytes();
  if (!secret) {
    throw new Error('MEDTECH_LAUNCH_COOKIE_SECRET missing or invalid (expected base64 32 bytes)');
  }

  const data = base64UrlDecodeToBuffer(token);
  if (data.length < 12 + 16 + 1) {
    throw new Error('Invalid launch cookie token');
  }

  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const ciphertext = data.subarray(28);

  const decipher = crypto.createDecipheriv('aes-256-gcm', secret, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString('utf8')) as T;
}

export function setMedtechLaunchCookieOn(cookieStore: CookieStore, ctx: MedtechLaunchContext, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const exp = Date.now() + ttlSeconds * 1000;
  const payload: LaunchCookiePayload = { v: 1, exp, ctx };
  const token = encryptJson(payload);

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/medtech-images',
    maxAge: ttlSeconds,
  });
}

export function clearMedtechLaunchCookieOn(cookieStore: CookieStore) {
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Reads and validates the launch cookie, then clears it (single-use).
 * Returns null if missing/expired/invalid.
 */
export function consumeMedtechLaunchCookieFrom(cookieStore: CookieStore): MedtechLaunchContext | null {
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const payload = decryptJson<LaunchCookiePayload>(token);
    if (payload?.v !== 1) return null;
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;

    const ctx = payload.ctx;
    if (!ctx || typeof ctx.patientId !== 'string' || !ctx.patientId.trim()) return null;
    if (typeof ctx.facilityId !== 'string' || !ctx.facilityId.trim()) return null;

    return {
      patientId: ctx.patientId,
      facilityId: ctx.facilityId,
      ...(ctx.providerId ? { providerId: ctx.providerId } : {}),
      ...(ctx.createdTime ? { createdTime: ctx.createdTime } : {}),
    };
  } catch {
    return null;
  } finally {
    clearMedtechLaunchCookieOn(cookieStore);
  }
}

