/**
 * Unit tests for OpenMailer email helpers.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  extractUrlsFromHtml,
  injectTrackingPixel,
  replaceLinksWithTracking,
} from '../email';

const TRACKING_BASE =
  process.env.NEXT_PUBLIC_APP_URL || 'https://clinicpro.co.nz';

describe('injectTrackingPixel', () => {
  it('injects pixel immediately before </body> when </body> is present', () => {
    const html = '<html><body><p>Hi</p></body></html>';
    const result = injectTrackingPixel(html, 'camp1', 'sub1');
    expect(result).toContain('</body>');
    const beforeBody = result.split('</body>')[0];
    expect(beforeBody).toContain(
      `${TRACKING_BASE}/api/openmailer/track/open?c=camp1&s=sub1`
    );
    expect(beforeBody).toContain('<img src="');
    expect(beforeBody).toContain('width="1" height="1"');
    expect(result).toMatch(/<img[^>]+><\/body>/);
  });

  it('appends pixel at end when HTML has no </body>', () => {
    const html = '<p>No body tag</p>';
    const result = injectTrackingPixel(html, 'c1', 's1');
    expect(result).toContain('<p>No body tag</p>');
    expect(result).toContain('/api/openmailer/track/open?');
    expect(result).toContain('c=c1');
    expect(result).toContain('s=s1');
  });

  it('encodes campaignId and subscriberId in pixel URL', () => {
    const html = '<p>x</p>';
    const result = injectTrackingPixel(html, 'a+b', 's=1');
    // encodeURIComponent('a+b') => 'a%2Bb', encodeURIComponent('s=1') => 's%3D1'
    expect(result).toContain('c=a%2Bb');
    expect(result).toContain('s=s%3D1');
  });
});

describe('replaceLinksWithTracking', () => {
  it('replaces one link with tracking URL containing /click/abc and s=sub1', () => {
    const html = '<a href="https://example.com">Link</a>';
    const linkMap = [{ url: 'https://example.com', shortCode: 'abc' }];
    const result = replaceLinksWithTracking(html, linkMap, 'sub1');
    expect(result).toContain(
      `${TRACKING_BASE}/api/openmailer/track/click/abc?s=sub1`
    );
    expect(result).not.toContain('href="https://example.com"');
  });

  it('replaces same URL appearing twice', () => {
    const html =
      '<a href="https://example.com">A</a> <a href="https://example.com">B</a>';
    const linkMap = [{ url: 'https://example.com', shortCode: 'x' }];
    const result = replaceLinksWithTracking(html, linkMap, 'sub1');
    const count = (result.match(/track\/click\/x/g) ?? []).length;
    expect(count).toBe(2);
  });

  it('replaces href with single quotes', () => {
    const html = "<a href='https://example.com'>Link</a>";
    const linkMap = [{ url: 'https://example.com', shortCode: 'abc' }];
    const result = replaceLinksWithTracking(html, linkMap, 'sub1');
    expect(result).toContain(
      `${TRACKING_BASE}/api/openmailer/track/click/abc?s=sub1`
    );
    expect(result).not.toContain("href='https://example.com'");
  });

  it('leaves URL unchanged when not in linkMap', () => {
    const html = '<a href="https://other.com">Other</a>';
    const linkMap = [{ url: 'https://example.com', shortCode: 'abc' }];
    const result = replaceLinksWithTracking(html, linkMap, 'sub1');
    expect(result).toContain('href="https://other.com"');
    expect(result).not.toContain('/track/click/');
  });
});

describe('extractUrlsFromHtml', () => {
  it('returns array with one URL for single href', () => {
    const html = '<a href="https://example.com">Link</a>';
    expect(extractUrlsFromHtml(html)).toEqual(['https://example.com']);
  });

  it('returns unique URLs only (no duplicates)', () => {
    const html =
      '<a href="https://example.com">A</a><a href="https://example.com">B</a>';
    expect(extractUrlsFromHtml(html)).toEqual(['https://example.com']);
  });

  it('excludes mailto and # anchors', () => {
    const html =
      '<a href="mailto:x@y.com">Mail</a><a href="#">Top</a><a href="https://example.com">Link</a>';
    const urls = extractUrlsFromHtml(html);
    expect(urls).not.toContain('mailto:x@y.com');
    expect(urls).not.toContain('#');
    expect(urls).toContain('https://example.com');
  });

  it('extracts URLs from both double and single quoted hrefs', () => {
    const html =
      '<a href="https://a.com">A</a><a href=\'https://b.com\'>B</a>';
    const urls = extractUrlsFromHtml(html);
    expect(urls).toContain('https://a.com');
    expect(urls).toContain('https://b.com');
    expect(urls).toHaveLength(2);
  });
});

// Mock Resend so sendOpenmailerEmail uses the mock (hoisted so factory can use it)
const { mockSend } = vi.hoisted(() => ({ mockSend: vi.fn() }));
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

describe('sendOpenmailerEmail', () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  it('returns success and messageId when Resend succeeds', async () => {
    mockSend.mockResolvedValue({ data: { id: 're_xyz' }, error: null });
    const getSend = async () => {
      const mod = await import('../email');
      return mod.sendOpenmailerEmail;
    };
    const send = await getSend();
    const result = await send({
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Hi</p>',
      from: 'sender@example.com',
    });
    expect(result).toEqual({ success: true, messageId: 're_xyz' });
    expect(mockSend).toHaveBeenCalledWith({
      from: 'sender@example.com',
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Hi</p>',
      text: undefined,
      replyTo: undefined,
    });
  });

  it('returns success: false and error message on API error', async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { message: 'Invalid key' },
    });
    const getSend = async () => {
      const mod = await import('../email');
      return mod.sendOpenmailerEmail;
    };
    const send = await getSend();
    const result = await send({
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Hi</p>',
      from: 'sender@example.com',
    });
    expect(result).toEqual({ success: false, error: 'Invalid key' });
  });

  it('returns success: false and error message when send throws', async () => {
    mockSend.mockRejectedValue(new Error('Network error'));
    const getSend = async () => {
      const mod = await import('../email');
      return mod.sendOpenmailerEmail;
    };
    const send = await getSend();
    const result = await send({
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Hi</p>',
      from: 'sender@example.com',
    });
    expect(result).toEqual({ success: false, error: 'Network error' });
  });
});
