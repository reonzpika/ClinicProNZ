import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { GET } from '../route';

/**
 * PWA installability tests per Add to Home Screen test plan (section 1).
 * Verifies manifest returns valid JSON with name, short_name, icons 192/512,
 * and that icon assets exist so they can be served.
 */
describe('referral-images manifest (PWA installability)', () => {
  it('GET returns 200 with Content-Type application/manifest+json', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/manifest+json');
  });

  it('manifest has name "ClinicPro Referral Images" and short_name "Referrals"', async () => {
    const res = await GET();
    const data = await res.json();
    expect(data.name).toBe('ClinicPro Referral Images');
    expect(data.short_name).toBe('Referrals');
  });

  it('manifest has start_url, display standalone, and icons 192 and 512', async () => {
    const res = await GET();
    const data = await res.json();
    expect(data.start_url).toBe('/referral-images/capture');
    expect(data.display).toBe('standalone');
    expect(Array.isArray(data.icons)).toBe(true);
    const sizes = data.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
    const icon192 = data.icons.find((i: { sizes: string }) => i.sizes === '192x192');
    const icon512 = data.icons.find((i: { sizes: string }) => i.sizes === '512x512');
    expect(icon192?.src).toBe('/icons/referral-icon-192.png');
    expect(icon192?.purpose).toContain('maskable');
    expect(icon512?.src).toBe('/icons/referral-icon-512.png');
    expect(icon512?.purpose).toContain('maskable');
  });

  it('icon assets exist in public so they can be served', () => {
    const root = path.resolve(process.cwd(), 'public');
    expect(fs.existsSync(path.join(root, 'icons', 'referral-icon-192.png'))).toBe(true);
    expect(fs.existsSync(path.join(root, 'icons', 'referral-icon-512.png'))).toBe(true);
    expect(fs.existsSync(path.join(root, 'icons', 'referral-icon-180.png'))).toBe(true);
  });
});
