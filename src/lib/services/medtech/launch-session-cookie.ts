import crypto from 'node:crypto';

export type MedtechLaunchSessionContext = {
  /**
   * Comes from Medtech vendor forms decrypted payload.
   * May be null if no patient is selected in the pallet.
   */
  patientId: string | null;
  /**
   * Facility code (required).
   * Medtech calls this `facilityCode`; we store it as `facilityId` everywhere else.
   */
  facilityId: string;
  providerId?: string | null;
  createdTime?: string | null;
  /**
   * Internal widget session identifier (not necessarily a real FHIR Encounter).
   * We keep it off the URL; it is required by existing widget state and commit flows.
   */
  encounterId: string;
};

type MedtechLaunchSessionPayload = {
  v: 1;
  iatMs: number;
  expMs: number;
  jti: string;
  context: MedtechLaunchSessionContext;
};

const COOKIE_AAD = 'medtech-launch-v1';

function base64UrlEncode(buf: Buffer): string {
  return buf
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

function base64UrlDecode(input: string): Buffer {
  const normalised = input.replaceAll('-', '+').replaceAll('_', '/');
  const pad = normalised.length % 4 === 0 ? '' : '='.repeat(4 - (normalised.length % 4));
  return Buffer.from(normalised + pad, 'base64');
}

function deriveAesKeyFromSecret(secret: string): Buffer {
  // Avoid requiring a specific encoding; hash gives a fixed 32-byte key.
  return crypto.createHash('sha256').update(secret, 'utf8').digest();
}

export function createMedtechLaunchCookieValue(params: {
  secret: string;
  ttlSeconds: number;
  context: MedtechLaunchSessionContext;
  nowMs?: number;
}): string {
  const nowMs = typeof params.nowMs === 'number' ? params.nowMs : Date.now();
  const ttlSeconds = params.ttlSeconds;
  const expMs = nowMs + ttlSeconds * 1000;

  const payload: MedtechLaunchSessionPayload = {
    v: 1,
    iatMs: nowMs,
    expMs,
    jti: crypto.randomUUID(),
    context: params.context,
  };

  const key = deriveAesKeyFromSecret(params.secret);
  const iv = crypto.randomBytes(12); // recommended IV length for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from(COOKIE_AAD, 'utf8'));

  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag(); // 16 bytes

  return base64UrlEncode(Buffer.concat([iv, tag, ciphertext]));
}

export function readMedtechLaunchCookieValue(params: {
  secret: string;
  value: string;
  nowMs?: number;
}): MedtechLaunchSessionPayload | null {
  try {
    const nowMs = typeof params.nowMs === 'number' ? params.nowMs : Date.now();
    const buf = base64UrlDecode(params.value);

    if (buf.length < 12 + 16 + 1) return null;
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const ciphertext = buf.subarray(28);

    const key = deriveAesKeyFromSecret(params.secret);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAAD(Buffer.from(COOKIE_AAD, 'utf8'));
    decipher.setAuthTag(tag);

    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    const parsed = JSON.parse(plaintext.toString('utf8')) as MedtechLaunchSessionPayload;

    if (!parsed || parsed.v !== 1) return null;
    if (typeof parsed.expMs !== 'number' || nowMs > parsed.expMs) return null;
    if (!parsed.context || typeof parsed.context.facilityId !== 'string') return null;
    if (!('patientId' in parsed.context)) return null;
    if (typeof parsed.context.encounterId !== 'string' || !parsed.context.encounterId.trim()) return null;

    return parsed;
  } catch {
    return null;
  }
}

