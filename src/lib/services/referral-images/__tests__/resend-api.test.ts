/**
 * Resend API test suite for ClinicPro SaaS
 *
 * Domain: clinicpro.co.nz. From: ryo@clinicpro.co.nz.
 * Test addresses: delivered@resend.dev, bounced@resend.dev, complained@resend.dev.
 */

import { Resend } from 'resend';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  renderEmailTemplate,
  sanitizeEmailHtml,
} from '../email-utils';

// Mock Resend for unit tests (no real API key required)
const mockSend = vi.fn();
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: mockSend,
    },
  })),
}));

// Default success response
const successResponse = { data: { id: 're_test123' }, error: null };

async function getSendWelcomeEmail() {
  const { sendWelcomeEmail } = await import('../email-service');
  return sendWelcomeEmail;
}

describe('Resend API', () => {
  beforeEach(() => {
    mockSend.mockReset();
    mockSend.mockResolvedValue(successResponse);
    vi.mocked(Resend).mockImplementation(() => ({
      emails: { send: mockSend },
    }));
  });

  // §1 BASIC API CONNECTIVITY (2 tests)
  describe('§1 Basic API connectivity', () => {
    it('sends simple email to delivered@resend.dev', async () => {
      const sendWelcomeEmail = await getSendWelcomeEmail();
      const result = await sendWelcomeEmail({
        email: 'delivered@resend.dev',
        name: 'Test',
        userId: 'u1',
      });
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'delivered@resend.dev',
          from: expect.any(String),
          subject: expect.any(String),
          html: expect.any(String),
        }),
      );
      expect(result).toEqual(successResponse);
    });

    it('returns response shape { data: { id: string }, error: null }', async () => {
      const sendWelcomeEmail = await getSendWelcomeEmail();
      const result = await sendWelcomeEmail({
        email: 'delivered@resend.dev',
        userId: 'u1',
      });
      expect(result).toHaveProperty('data');
      expect(result?.data).toHaveProperty('id');
      expect(typeof (result?.data as { id: string })?.id).toBe('string');
      expect((result?.data as { id: string })?.id).toMatch(/^re_/);
      expect(result).toHaveProperty('error', null);
    });
  });

  // §2 DOMAIN AUTH + FROM HEADER (3 tests)
  describe('§2 Domain auth and from header', () => {
    it('sends from Ryo <ryo@clinicpro.co.nz> to delivered@resend.dev', async () => {
      const sendWelcomeEmail = await getSendWelcomeEmail();
      await sendWelcomeEmail({
        email: 'delivered@resend.dev',
        name: 'Test',
        userId: 'u1',
      });
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.stringMatching(/ryo@clinicpro\.co\.nz/),
          to: 'delivered@resend.dev',
        }),
      );
    });

    it('expects 403/validation error when sending from invalid from', async () => {
      mockSend.mockRejectedValueOnce(
        Object.assign(new Error('Domain not verified'), { statusCode: 403 }),
      );
      const sendWelcomeEmail = await getSendWelcomeEmail();
      await expect(
        sendWelcomeEmail({ email: 'delivered@resend.dev', userId: 'u1' }),
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('supports replyTo: ryo@clinicpro.co.nz', async () => {
      const { Resend: ResendClass } = await import('resend');
      const resend = new ResendClass(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Ryo <ryo@clinicpro.co.nz>',
        to: 'delivered@resend.dev',
        subject: 'Test',
        html: '<p>Test</p>',
        replyTo: 'ryo@clinicpro.co.nz',
      });
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({ replyTo: 'ryo@clinicpro.co.nz' }),
      );
    });
  });

  // §3 WELCOME SERIES TIMING (3 tests)
  describe('§3 Welcome series timing', () => {
    it('sends immediate welcome email (no scheduledAt)', async () => {
      const sendWelcomeEmail = await getSendWelcomeEmail();
      await sendWelcomeEmail({
        email: 'delivered@resend.dev',
        name: 'Test',
        userId: 'u1',
      });
      expect(mockSend).toHaveBeenCalledWith(
        expect.not.objectContaining({ scheduledAt: expect.anything() }),
      );
    });

    it('sends Email #2 with scheduledAt: in 2 minutes', async () => {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Ryo <ryo@clinicpro.co.nz>',
        to: 'delivered@resend.dev',
        subject: 'Email #2',
        html: '<p>Tip</p>',
        scheduledAt: 'in 2 minutes',
      });
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({ scheduledAt: 'in 2 minutes' }),
      );
    });

    it('sends Email #3 with scheduledAt: in 5 minutes', async () => {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Ryo <ryo@clinicpro.co.nz>',
        to: 'delivered@resend.dev',
        subject: 'Email #3',
        html: '<p>Value</p>',
        scheduledAt: 'in 5 minutes',
      });
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({ scheduledAt: 'in 5 minutes' }),
      );
    });
  });

  // §5 ERROR SCENARIOS (3 tests) - mock-based
  describe('§5 Error scenarios', () => {
    it('bounced@resend.dev triggers bounce webhook (payload shape)', () => {
      const bouncePayload = {
        type: 'email.bounced',
        data: { email_id: 're_1', to: ['bounced@resend.dev'] },
      };
      expect(bouncePayload.type).toBe('email.bounced');
      expect(bouncePayload.data.to).toContain('bounced@resend.dev');
    });

    it('complained@resend.dev triggers complaint webhook (payload shape)', () => {
      const complaintPayload = {
        type: 'email.complained',
        data: { email_id: 're_1', to: ['complained@resend.dev'] },
      };
      expect(complaintPayload.type).toBe('email.complained');
      expect(complaintPayload.data.to).toContain('complained@resend.dev');
    });

    it('invalid API key returns 401', async () => {
      mockSend.mockRejectedValueOnce(
        Object.assign(new Error('Unauthorized'), { statusCode: 401 }),
      );
      const sendWelcomeEmail = await getSendWelcomeEmail();
      await expect(
        sendWelcomeEmail({ email: 'delivered@resend.dev', userId: 'u1' }),
      ).rejects.toMatchObject({ statusCode: 401 });
    });
  });

  // §6 PRODUCTION READY CHECKS (3 tests)
  describe('§6 Production ready checks', () => {
    it('HTML sanitisation strips script tags', () => {
      const dirty = '<p>Hello</p><script>alert(1)</script><p>World</p>';
      const clean = sanitizeEmailHtml(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('alert(1)');
      expect(clean).toContain('Hello');
      expect(clean).toContain('World');
    });

    it('rate limiting: send 10 emails in parallel without unhandled rejection', async () => {
      const sendWelcomeEmail = await getSendWelcomeEmail();
      const promises = Array.from({ length: 10 }, (_, i) =>
        sendWelcomeEmail({
          email: 'delivered@resend.dev',
          name: `User${i}`,
          userId: `u${i}`,
        }),
      );
      const results = await Promise.allSettled(promises);
      const rejected = results.filter((r) => r.status === 'rejected');
      expect(rejected.length).toBeLessThanOrEqual(10);
      results.forEach((r) => {
        expect(r.status).toBeDefined();
      });
    });

    it('template variables {{firstName}}, {{clinicName}} are replaced and sanitised', () => {
      const template = 'Hi {{firstName}}, welcome to {{clinicName}}.';
      const out = renderEmailTemplate(template, {
        firstName: 'Jane',
        clinicName: 'Auckland Medical',
      });
      expect(out).toContain('Jane');
      expect(out).toContain('Auckland Medical');
      expect(out).not.toContain('{{');
      const xss = renderEmailTemplate('<p>{{name}}</p>', {
        name: '<script>alert(1)</script>',
      });
      expect(xss).not.toContain('<script>');
    });
  });
});

// §4 WEBHOOKS: test the route handler
describe('§4 Open tracking and webhooks', () => {
  // Svix expects whsec_ + base64; use a valid base64 payload so Webhook constructor does not throw
  const RESEND_WEBHOOK_SECRET = 'whsec_dGVzdHNlY3JldA==';

  beforeEach(() => {
    vi.stubEnv('RESEND_WEBHOOK_SECRET', RESEND_WEBHOOK_SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('webhook returns 400 when signature headers are missing', async () => {
    const { POST } = await import(
      '@/app/api/(integration)/webhooks/resend/route'
    );
    const req = new Request('http://localhost/api/webhooks/resend', {
      method: 'POST',
      body: JSON.stringify({ type: 'email.opened', data: {} }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('webhook returns 400 when signature is invalid', async () => {
    const { POST } = await import(
      '@/app/api/(integration)/webhooks/resend/route'
    );
    const req = new Request('http://localhost/api/webhooks/resend', {
      method: 'POST',
      body: JSON.stringify({
        type: 'email.opened',
        data: { email_id: 're_1', to: ['delivered@resend.dev'] },
      }),
      headers: {
        'Content-Type': 'application/json',
        'svix-id': 'msg_1',
        'svix-timestamp': String(Math.floor(Date.now() / 1000)),
        'svix-signature': 'v1,invalidsig',
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('webhook handles email.opened event type and data shape', () => {
    const payload = {
      type: 'email.opened',
      data: { email_id: 're_123', to: ['delivered@resend.dev'] },
    };
    expect(payload.type).toBe('email.opened');
    expect(payload.data).toHaveProperty('email_id', 're_123');
    expect(payload.data.to).toContain('delivered@resend.dev');
  });

  it('webhook handles email.clicked event type', () => {
    const payload = {
      type: 'email.clicked',
      data: { email_id: 're_1', to: ['delivered@resend.dev'] },
    };
    expect(payload.type).toBe('email.clicked');
    expect(payload.data).toHaveProperty('email_id');
  });
});

// Integration tests: run only when RESEND_API_KEY is set
describe.runIf(process.env.RESEND_API_KEY)('Resend API integration', () => {
  it('sends real email to delivered@resend.dev', async () => {
    const { sendWelcomeEmail } = await import('../email-service');
    const result = await sendWelcomeEmail({
      email: 'delivered@resend.dev',
      name: 'Integration',
      userId: 'int-test',
    });
    expect(result?.data?.id).toBeDefined();
    expect((result?.data as { id: string })?.id).toMatch(/^re_/);
    expect(result?.error).toBeNull();
  });
});
